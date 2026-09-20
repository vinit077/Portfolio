-- ============================================================
-- Portfolio v2 — Dynamic Stack Management Schema
-- ============================================================

create table if not exists stack_categories (
  id             uuid primary key default gen_random_uuid(),
  label          text not null,
  category       text not null,
  chips          text[] not null default '{}',
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Auto-update updated_at
create trigger stack_categories_updated_at
  before update on stack_categories
  for each row execute function update_updated_at();

-- RLS
alter table stack_categories enable row level security;

drop policy if exists "public_read_stack" on stack_categories;
create policy "public_read_stack"
  on stack_categories for select
  using (true);

drop policy if exists "owner_write_stack" on stack_categories;
create policy "owner_write_stack"
  on stack_categories for all
  using (auth.uid() = 'a1068e61-46f1-41a0-b16f-ff2aec8e94ba'::uuid);

-- Seed initial data
insert into stack_categories (label, category, chips, sort_order)
values
  ('languages', 'lang', array['Java', 'SQL', 'JavaScript', 'Dart', 'HTML5', 'CSS3'], 0),
  ('frontend', 'front', array['React.js', 'Next.js'], 1),
  ('backend', 'back', array['Spring Boot', 'Spring Security', 'Spring MVC', 'Node.js', 'Express.js'], 2),
  ('data', 'data', array['MySQL', 'MongoDB', 'PostgreSQL', 'Firebase', 'Supabase'], 3),
  ('tooling', 'tool', array['Git', 'GitHub', 'Docker', 'Swagger', 'VS Code', 'Android Studio'], 4),
  ('concepts', 'concept', array['OOP', 'DSA', 'REST APIs', 'JWT Auth', 'Hibernate', 'CRUD'], 5);
