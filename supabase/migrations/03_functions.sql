-- Function to match documents by similarity (for semantic search)
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table(
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    a.id,
    a.content,
    1 - (a.embedding <=> query_embedding) as similarity
  from public.articles a
  where 1 - (a.embedding <=> query_embedding) > match_threshold
  order by a.embedding <=> query_embedding
  limit match_count;
$$;

-- Function to handle new user creation (trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'learner');
  return new;
end;
$$;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to calculate course completion percentage
create or replace function calculate_course_completion(enrollment_id uuid)
returns float
language sql stable
as $$
  select
    case 
      when total_lessons = 0 then 0
      else round((completed_lessons::float / total_lessons::float) * 100, 2)
    end
  from (
    select
      count(*) filter (where p.status = 'completed') as completed_lessons,
      count(*) as total_lessons
    from public.progress p
    where p.enrollment_id = $1
      and p.lesson_id is not null
  ) as lesson_stats;
$$;

-- Function to update enrollment progress (trigger)
create or replace function update_enrollment_progress()
returns trigger
language plpgsql
as $$
begin
  update public.enrollments
  set 
    progress_percentage = calculate_course_completion(new.enrollment_id),
    last_accessed_at = now(),
    updated_at = now()
  where id = new.enrollment_id;
  
  return new;
end;
$$;

-- Trigger to update enrollment progress when lesson progress changes
create trigger on_progress_updated
  after insert or update on public.progress
  for each row execute procedure update_enrollment_progress();

-- Function to check badge criteria and award badges
create or replace function check_and_award_badges(user_id uuid, course_id uuid)
returns void
language plpgsql
as $$
declare
  badge_record record;
  enrollment_record record;
  completion_percentage float;
begin
  -- Get enrollment details
  select * into enrollment_record
  from public.enrollments e
  where e.user_id = user_id and e.course_id = course_id;
  
  if not found then
    return;
  end if;
  
  completion_percentage := calculate_course_completion(enrollment_record.id);
  
  -- Check course completion badge
  for badge_record in
    select b.* from public.badges b
    join public.courses c on b.tenant_id = c.tenant_id
    where c.id = course_id
      and b.is_active = true
      and (b.criteria->>'type' = 'course_completion' or b.criteria->>'type' = 'level_completion')
  loop
    -- Award course completion badge
    if badge_record.criteria->>'type' = 'course_completion' and completion_percentage >= 100 then
      insert into public.user_badges (user_id, badge_id)
      values (user_id, badge_record.id)
      on conflict (user_id, badge_id) do nothing;
    end if;
    
    -- Award level completion badge
    if badge_record.criteria->>'type' = 'level_completion' then
      declare
        required_level text := badge_record.criteria->>'level';
        course_level text;
      begin
        select level into course_level from public.courses where id = course_id;
        
        if course_level = required_level and completion_percentage >= 100 then
          insert into public.user_badges (user_id, badge_id)
          values (user_id, badge_record.id)
          on conflict (user_id, badge_id) do nothing;
        end if;
      end;
    end if;
  end loop;
end;
$$;

-- Function to generate course certificate
create or replace function generate_certificate(user_id uuid, course_id uuid)
returns uuid
language plpgsql
as $$
declare
  certificate_id uuid;
  verification_code text;
begin
  -- Generate verification code
  verification_code := encode(gen_random_bytes(8), 'hex');
  
  -- Create certificate record
  insert into public.certificates (user_id, course_id, certificate_url, verification_code)
  values (
    user_id,
    course_id,
    '/certificates/' || user_id::text || '/' || course_id::text || '.pdf',
    verification_code
  )
  returning id into certificate_id;
  
  return certificate_id;
end;
$$;

-- Function to handle course completion
create or replace function handle_course_completion()
returns trigger
language plpgsql
as $$
begin
  if new.progress_percentage >= 100 and (old.progress_percentage < 100 or old.progress_percentage is null) then
    -- Mark enrollment as completed
    update public.enrollments
    set 
      status = 'completed',
      completed_at = now()
    where id = new.id;
    
    -- Award badges
    perform check_and_award_badges(new.user_id, new.course_id);
    
    -- Generate certificate
    perform generate_certificate(new.user_id, new.course_id);
  end if;
  
  return new;
end;
$$;

-- Trigger for course completion
create trigger on_course_completion
  after update on public.enrollments
  for each row
  when (new.progress_percentage >= 100)
  execute procedure handle_course_completion();

-- Function to get course recommendations
create or replace function get_course_recommendations(user_id uuid, limit_count int default 5)
returns table(
  course_id uuid,
  title text,
  description text,
  level text,
  similarity_score float
)
language sql stable
as $$
  with user_completions as (
    select c.id, c.title, c.description, c.level
    from public.courses c
    join public.enrollments e on c.id = e.course_id
    where e.user_id = user_id and e.status = 'completed'
  ),
  available_courses as (
    select c.id, c.title, c.description, c.level
    from public.courses c
    left join public.enrollments e on c.id = e.course_id and e.user_id = user_id
    where c.status = 'published'
      and e.id is null -- not already enrolled
  )
  select
    ac.id as course_id,
    ac.title,
    ac.description,
    ac.level,
    0.5 as similarity_score -- Placeholder for now
  from available_courses ac
  limit limit_count;
$$;