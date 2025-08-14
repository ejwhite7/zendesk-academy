-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  role text check (role in ('admin', 'learner')) default 'learner',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  profile jsonb
);

-- Tenants table for multi-tenancy
create table public.tenants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  subdomain text unique,
  custom_domain text unique,
  branding jsonb,
  zendesk_config jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Knowledge sources (Zendesk, Confluence, etc.)
create table public.knowledge_sources (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  type text check (type in ('zendesk', 'confluence', 'notion', 'github')) not null,
  config jsonb not null,
  last_sync_at timestamp with time zone,
  status text check (status in ('active', 'inactive', 'syncing', 'error')) default 'inactive',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Articles from knowledge sources
create table public.articles (
  id uuid default uuid_generate_v4() primary key,
  knowledge_source_id uuid references public.knowledge_sources(id) on delete cascade not null,
  external_id text not null,
  title text not null,
  content text not null,
  html_content text,
  url text,
  author text,
  labels text[],
  section text,
  category text,
  last_modified_at timestamp with time zone not null,
  embedding vector(1536), -- OpenAI embedding dimension
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(knowledge_source_id, external_id)
);

-- Courses
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  title text not null,
  description text,
  level text check (level in ('beginner', 'intermediate', 'advanced', 'expert')) default 'beginner',
  status text check (status in ('draft', 'published', 'archived')) default 'draft',
  estimated_duration_minutes integer,
  prerequisites text[],
  learning_objectives text[],
  version integer default 1,
  ai_generated boolean default false,
  last_generated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Course modules
create table public.modules (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  order_index integer not null,
  estimated_duration_minutes integer,
  learning_objectives text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(course_id, order_index)
);

-- Lessons within modules
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references public.modules(id) on delete cascade not null,
  title text not null,
  content text not null,
  content_type text check (content_type in ('text', 'video', 'interactive', 'quiz')) default 'text',
  order_index integer not null,
  estimated_duration_minutes integer,
  source_articles text[], -- Array of article IDs
  ai_generated boolean default false,
  last_generated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(module_id, order_index)
);

-- Assessments (quizzes, scenarios, etc.)
create table public.assessments (
  id uuid default uuid_generate_v4() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  description text,
  assessment_type text check (assessment_type in ('quiz', 'scenario', 'simulation', 'checkpoint')) default 'quiz',
  passing_score integer default 70,
  max_attempts integer,
  time_limit_minutes integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (
    (lesson_id is not null and module_id is null and course_id is null) or
    (lesson_id is null and module_id is not null and course_id is null) or
    (lesson_id is null and module_id is null and course_id is not null)
  )
);

-- Questions within assessments
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  assessment_id uuid references public.assessments(id) on delete cascade not null,
  question_text text not null,
  question_type text check (question_type in ('multiple_choice', 'true_false', 'short_answer', 'scenario_branch')) default 'multiple_choice',
  order_index integer not null,
  points integer default 1,
  explanation text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(assessment_id, order_index)
);

-- Answer options for questions
create table public.answer_options (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions(id) on delete cascade not null,
  option_text text not null,
  is_correct boolean default false,
  order_index integer not null,
  explanation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(question_id, order_index)
);

-- User enrollments in courses
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  status text check (status in ('active', 'completed', 'dropped', 'suspended')) default 'active',
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  progress_percentage integer default 0,
  last_accessed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- Progress tracking for lessons and modules
create table public.progress (
  id uuid default uuid_generate_v4() primary key,
  enrollment_id uuid references public.enrollments(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  status text check (status in ('not_started', 'in_progress', 'completed', 'skipped')) default 'not_started',
  score integer,
  time_spent_minutes integer,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (
    (lesson_id is not null and module_id is null) or
    (lesson_id is null and module_id is not null)
  )
);

-- Assessment attempts
create table public.attempts (
  id uuid default uuid_generate_v4() primary key,
  enrollment_id uuid references public.enrollments(id) on delete cascade not null,
  assessment_id uuid references public.assessments(id) on delete cascade not null,
  attempt_number integer not null,
  score integer,
  max_score integer not null,
  passed boolean,
  time_spent_minutes integer,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  answers jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(enrollment_id, assessment_id, attempt_number)
);

-- Badges
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  description text not null,
  criteria jsonb not null,
  badge_image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User badges (earned badges)
create table public.user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  verification_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_id)
);

-- Certificates
create table public.certificates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  certificate_url text not null,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone,
  verification_code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- Webhook events
create table public.webhook_events (
  id uuid default uuid_generate_v4() primary key,
  source text not null,
  event_type text not null,
  payload jsonb not null,
  processed boolean default false,
  processed_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sync runs for knowledge sources
create table public.sync_runs (
  id uuid default uuid_generate_v4() primary key,
  knowledge_source_id uuid references public.knowledge_sources(id) on delete cascade not null,
  status text check (status in ('running', 'completed', 'failed')) default 'running',
  articles_processed integer,
  articles_created integer,
  articles_updated integer,
  error_message text,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_articles_embedding on public.articles using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index idx_articles_knowledge_source on public.articles(knowledge_source_id);
create index idx_articles_external_id on public.articles(external_id);
create index idx_courses_tenant on public.courses(tenant_id);
create index idx_modules_course on public.modules(course_id, order_index);
create index idx_lessons_module on public.lessons(module_id, order_index);
create index idx_enrollments_user on public.enrollments(user_id);
create index idx_enrollments_course on public.enrollments(course_id);
create index idx_progress_enrollment on public.progress(enrollment_id);
create index idx_attempts_enrollment on public.attempts(enrollment_id);
create index idx_webhook_events_processed on public.webhook_events(processed, created_at);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers
create trigger handle_users_updated_at before update on public.users for each row execute procedure public.handle_updated_at();
create trigger handle_tenants_updated_at before update on public.tenants for each row execute procedure public.handle_updated_at();
create trigger handle_knowledge_sources_updated_at before update on public.knowledge_sources for each row execute procedure public.handle_updated_at();
create trigger handle_articles_updated_at before update on public.articles for each row execute procedure public.handle_updated_at();
create trigger handle_courses_updated_at before update on public.courses for each row execute procedure public.handle_updated_at();
create trigger handle_modules_updated_at before update on public.modules for each row execute procedure public.handle_updated_at();
create trigger handle_lessons_updated_at before update on public.lessons for each row execute procedure public.handle_updated_at();
create trigger handle_assessments_updated_at before update on public.assessments for each row execute procedure public.handle_updated_at();
create trigger handle_questions_updated_at before update on public.questions for each row execute procedure public.handle_updated_at();
create trigger handle_answer_options_updated_at before update on public.answer_options for each row execute procedure public.handle_updated_at();
create trigger handle_enrollments_updated_at before update on public.enrollments for each row execute procedure public.handle_updated_at();
create trigger handle_progress_updated_at before update on public.progress for each row execute procedure public.handle_updated_at();
create trigger handle_attempts_updated_at before update on public.attempts for each row execute procedure public.handle_updated_at();
create trigger handle_badges_updated_at before update on public.badges for each row execute procedure public.handle_updated_at();