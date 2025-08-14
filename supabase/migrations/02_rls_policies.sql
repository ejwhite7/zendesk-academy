-- Enable Row Level Security on all tables
alter table public.users enable row level security;
alter table public.tenants enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.articles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.assessments enable row level security;
alter table public.questions enable row level security;
alter table public.answer_options enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.attempts enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.certificates enable row level security;
alter table public.webhook_events enable row level security;
alter table public.sync_runs enable row level security;

-- Helper function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = user_id and role = 'admin'
  );
$$;

-- Helper function to get user tenant
create or replace function public.get_user_tenant(user_id uuid)
returns uuid
language sql
security definer set search_path = public
as $$
  select tenant_id
  from public.users u
  join public.tenants t on u.email like '%@' || t.subdomain || '.%'
  where u.id = user_id
  limit 1;
$$;

-- Users policies
create policy "Users can view their own record" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own record" on public.users
  for update using (auth.uid() = id);

create policy "Admins can view all users" on public.users
  for select using (public.is_admin(auth.uid()));

create policy "Admins can create users" on public.users
  for insert with check (public.is_admin(auth.uid()));

-- Tenants policies
create policy "Admins can manage tenants" on public.tenants
  for all using (public.is_admin(auth.uid()));

create policy "Users can view their tenant" on public.tenants
  for select using (id = public.get_user_tenant(auth.uid()));

-- Knowledge sources policies
create policy "Admins can manage knowledge sources" on public.knowledge_sources
  for all using (public.is_admin(auth.uid()));

-- Articles policies
create policy "Admins can manage articles" on public.articles
  for all using (public.is_admin(auth.uid()));

create policy "Users can view articles from their tenant sources" on public.articles
  for select using (
    knowledge_source_id in (
      select ks.id
      from public.knowledge_sources ks
      where ks.tenant_id = public.get_user_tenant(auth.uid())
    )
  );

-- Courses policies
create policy "Admins can manage all courses" on public.courses
  for all using (public.is_admin(auth.uid()));

create policy "Users can view published courses from their tenant" on public.courses
  for select using (
    tenant_id = public.get_user_tenant(auth.uid()) and status = 'published'
  );

-- Modules policies
create policy "Admins can manage modules" on public.modules
  for all using (public.is_admin(auth.uid()));

create policy "Users can view modules from accessible courses" on public.modules
  for select using (
    course_id in (
      select c.id
      from public.courses c
      where c.tenant_id = public.get_user_tenant(auth.uid()) and c.status = 'published'
    )
  );

-- Lessons policies
create policy "Admins can manage lessons" on public.lessons
  for all using (public.is_admin(auth.uid()));

create policy "Users can view lessons from accessible modules" on public.lessons
  for select using (
    module_id in (
      select m.id
      from public.modules m
      join public.courses c on m.course_id = c.id
      where c.tenant_id = public.get_user_tenant(auth.uid()) and c.status = 'published'
    )
  );

-- Assessments policies
create policy "Admins can manage assessments" on public.assessments
  for all using (public.is_admin(auth.uid()));

create policy "Users can view assessments from accessible content" on public.assessments
  for select using (
    (lesson_id in (
      select l.id
      from public.lessons l
      join public.modules m on l.module_id = m.id
      join public.courses c on m.course_id = c.id
      where c.tenant_id = public.get_user_tenant(auth.uid()) and c.status = 'published'
    )) or
    (module_id in (
      select m.id
      from public.modules m
      join public.courses c on m.course_id = c.id
      where c.tenant_id = public.get_user_tenant(auth.uid()) and c.status = 'published'
    )) or
    (course_id in (
      select c.id
      from public.courses c
      where c.tenant_id = public.get_user_tenant(auth.uid()) and c.status = 'published'
    ))
  );

-- Questions and answer options policies
create policy "Admins can manage questions" on public.questions
  for all using (public.is_admin(auth.uid()));

create policy "Users can view questions from accessible assessments" on public.questions
  for select using (
    assessment_id in (
      select a.id
      from public.assessments a
      left join public.lessons l on a.lesson_id = l.id
      left join public.modules m on a.module_id = m.id or l.module_id = m.id
      left join public.courses c on a.course_id = c.id or m.course_id = c.id
      where c.tenant_id = public.get_user_tenant(auth.uid()) and c.status = 'published'
    )
  );

create policy "Admins can manage answer options" on public.answer_options
  for all using (public.is_admin(auth.uid()));

create policy "Users can view answer options from accessible questions" on public.answer_options
  for select using (
    question_id in (
      select q.id
      from public.questions q
      join public.assessments a on q.assessment_id = a.id
      left join public.lessons l on a.lesson_id = l.id
      left join public.modules m on a.module_id = m.id or l.module_id = m.id
      left join public.courses c on a.course_id = c.id or m.course_id = c.id
      where c.tenant_id = public.get_user_tenant(auth.uid()) and c.status = 'published'
    )
  );

-- Enrollments policies
create policy "Users can view their own enrollments" on public.enrollments
  for select using (auth.uid() = user_id);

create policy "Users can create their own enrollments" on public.enrollments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own enrollments" on public.enrollments
  for update using (auth.uid() = user_id);

create policy "Admins can view all enrollments" on public.enrollments
  for select using (public.is_admin(auth.uid()));

-- Progress policies
create policy "Users can view their own progress" on public.progress
  for select using (
    enrollment_id in (
      select e.id
      from public.enrollments e
      where e.user_id = auth.uid()
    )
  );

create policy "Users can create their own progress" on public.progress
  for insert with check (
    enrollment_id in (
      select e.id
      from public.enrollments e
      where e.user_id = auth.uid()
    )
  );

create policy "Users can update their own progress" on public.progress
  for update using (
    enrollment_id in (
      select e.id
      from public.enrollments e
      where e.user_id = auth.uid()
    )
  );

create policy "Admins can view all progress" on public.progress
  for select using (public.is_admin(auth.uid()));

-- Attempts policies
create policy "Users can manage their own attempts" on public.attempts
  for all using (
    enrollment_id in (
      select e.id
      from public.enrollments e
      where e.user_id = auth.uid()
    )
  );

create policy "Admins can view all attempts" on public.attempts
  for select using (public.is_admin(auth.uid()));

-- Badges policies
create policy "Admins can manage badges" on public.badges
  for all using (public.is_admin(auth.uid()));

create policy "Users can view badges from their tenant" on public.badges
  for select using (tenant_id = public.get_user_tenant(auth.uid()));

-- User badges policies
create policy "Users can view their own badges" on public.user_badges
  for select using (auth.uid() = user_id);

create policy "System can create user badges" on public.user_badges
  for insert with check (true);

create policy "Admins can view all user badges" on public.user_badges
  for select using (public.is_admin(auth.uid()));

-- Certificates policies
create policy "Users can view their own certificates" on public.certificates
  for select using (auth.uid() = user_id);

create policy "System can create certificates" on public.certificates
  for insert with check (true);

create policy "Admins can view all certificates" on public.certificates
  for select using (public.is_admin(auth.uid()));

-- Webhook events policies (admin only)
create policy "Admins can manage webhook events" on public.webhook_events
  for all using (public.is_admin(auth.uid()));

-- Sync runs policies (admin only)
create policy "Admins can manage sync runs" on public.sync_runs
  for all using (public.is_admin(auth.uid()));