-- ============================================================
-- Portfolio v2 — Initial Schema
-- Run via: supabase db push
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_cron;
create extension if not exists pg_net;

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
  last_synced_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

-- ─── CODING STATS CACHE ──────────────────────────────────────
-- One row per platform, always overwritten on sync (not time-series)
create table if not exists coding_stats_cache (
  platform       text primary key,           -- 'leetcode' | 'codeforces'
  handle         text not null,
  profile_url    text not null,
  stats          jsonb not null,             -- see shape in comments below
  last_synced_at timestamptz not null default now(),
  last_error     text                        -- last failure, for owner visibility
);

-- LeetCode stats shape:
-- { "solved": 312, "easy": [120, 145], "medium": [150, 280], "hard": [42, 210], "acceptance_rate": 61.2 }
-- Codeforces stats shape:
-- { "rating": 1412, "max_rating": 1412, "rank": "pupil", "contests": 6 }

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

-- Projects: public read (published only), owner full access
alter table projects enable row level security;

create policy "public_read_published"
  on projects for select
  using (published = true);

-- NOTE: Replace <YOUR-AUTH-UID> after you create your owner account in Supabase Auth
-- Get your UID from: Supabase Dashboard → Authentication → Users → copy your user UUID
create policy "owner_full_access"
  on projects for all
  using (auth.uid() = '<YOUR-AUTH-UID>'::uuid);

-- Coding stats: public read all, owner write
alter table coding_stats_cache enable row level security;

create policy "public_read_coding_stats"
  on coding_stats_cache for select
  using (true);

create policy "owner_write_coding_stats"
  on coding_stats_cache for all
  using (auth.uid() = '<YOUR-AUTH-UID>'::uuid);

-- Sync log: owner read only
alter table sync_log enable row level security;

create policy "owner_read_sync_log"
  on sync_log for all
  using (auth.uid() = '<YOUR-AUTH-UID>'::uuid);

-- ─── SCHEDULED SYNC (pg_cron) ────────────────────────────────
-- Syncs LeetCode + Codeforces stats every 12 hours
-- Also acts as a keepalive ping to prevent Supabase free-tier project pause
-- Run this AFTER you deploy the Edge Functions and have the URLs

-- Uncomment and fill in your values after initial setup:
/*
select cron.schedule(
  'sync-coding-stats',
  '0 */12 * * *',
  $$
    select net.http_post(
      url     := 'https://<YOUR-PROJECT-REF>.functions.supabase.co/sync-coding-stats',
      headers := jsonb_build_object(
                   'Authorization', 'Bearer <YOUR-SERVICE-ROLE-KEY>',
                   'Content-Type', 'application/json'
                 ),
      body    := '{}'::jsonb
    );
  $$
);
*/

-- ─── SEED: Initial projects ───────────────────────────────────
-- Migrate the 2 existing v1 projects into the DB
-- (Skipping repo_url since these may not have public GitHub repos — update as needed)
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
