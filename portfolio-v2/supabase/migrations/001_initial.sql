-- ============================================================
-- Portfolio v2 — Initial Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- ─── PROJECTS ────────────────────────────────────────────────
create table if not exists projects (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  repo_url       text not null,
  repo_owner     text not null,
  repo_name      text not null,
  title          text not null,
  description    text not null,
  tags           text[] not null default '{}',
  stars          int not null default 0,
  primary_lang   text,
  method_badge   text not null default 'GET',
  status_code    int not null default 200,
  sort_order     int not null default 0,
  published      boolean not null default false,
  demo_url       text,
  last_synced_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table projects add column if not exists demo_url text;

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_updated_at on projects;
create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

-- ─── CODING STATS CACHE ──────────────────────────────────────
create table if not exists coding_stats_cache (
  platform       text primary key,           -- 'leetcode' | 'codeforces'
  handle         text not null,
  profile_url    text not null,
  stats          jsonb not null,
  last_synced_at timestamptz not null default now(),
  last_error     text
);

-- ─── SYNC LOG ────────────────────────────────────────────────
create table if not exists sync_log (
  id         uuid primary key default gen_random_uuid(),
  source     text not null,                  -- 'github-import' | 'leetcode-sync' | 'codeforces-sync'
  target_id  text,
  success    boolean not null,
  message    text,
  created_at timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

-- Projects RLS
alter table projects enable row level security;

drop policy if exists "public_read_published" on projects;
create policy "public_read_published"
  on projects for select
  using (published = true);

drop policy if exists "owner_full_access" on projects;
create policy "owner_full_access"
  on projects for all
  using (auth.uid() = 'a1068e61-46f1-41a0-b16f-ff2aec8e94ba'::uuid);

-- Coding Stats RLS
alter table coding_stats_cache enable row level security;

drop policy if exists "public_read_coding_stats" on coding_stats_cache;
create policy "public_read_coding_stats"
  on coding_stats_cache for select
  using (true);

drop policy if exists "owner_write_coding_stats" on coding_stats_cache;
create policy "owner_write_coding_stats"
  on coding_stats_cache for all
  using (auth.uid() = 'a1068e61-46f1-41a0-b16f-ff2aec8e94ba'::uuid);

-- Sync Log RLS
alter table sync_log enable row level security;

drop policy if exists "owner_read_sync_log" on sync_log;
create policy "owner_read_sync_log"
  on sync_log for all
  using (auth.uid() = 'a1068e61-46f1-41a0-b16f-ff2aec8e94ba'::uuid);

-- ─── SEED: Initial projects ───────────────────────────────────
insert into projects (
  slug, repo_url, repo_owner, repo_name,
  title, description, tags,
  stars, primary_lang, method_badge, status_code,
  sort_order, published, last_synced_at
) values
(
  'employee-leave-portal',
  'https://github.com/vinit077',
  'vinit077',
  'employee-leave-portal',
  'Enterprise Employee Management & Leave Portal',
  'A full-stack HR system with JWT authentication and role-based authorization, covering employee records, leave requests, and attendance in one layered application. RESTful APIs built with Hibernate (JPA), documented and tested through Swagger, behind a responsive React frontend.',
  array['Spring Boot', 'React', 'MySQL', 'JWT', 'Hibernate'],
  0, 'Java', 'GET', 200, 0, true, now()
),
(
  'ai-expense-splitter',
  'https://github.com/vinit077',
  'vinit077',
  'ai-expense-splitter',
  'AI Expense Splitter',
  'A group expense manager with secure authentication, shared expense tracking, and automatic settlement calculations, so groups always know who owes what. Dashboard views and backend services built for fast, reliable everyday use.',
  array['Full Stack', 'Auth', 'Dashboards', 'REST API'],
  0, 'Java', 'GET', 200, 1, true, now()
)
on conflict (slug) do nothing;
