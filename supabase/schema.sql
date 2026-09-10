-- Wheel of Eden schema

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists spins (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  spun_at timestamptz not null default now()
);

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  current_idea_id uuid references ideas(id) on delete set null
);

insert into settings (id, current_idea_id) values (1, null)
on conflict (id) do nothing;

-- Row Level Security: public can only read. All writes go through the
-- server using the service role key (which bypasses RLS), gated by the
-- admin PIN in the app itself.
alter table ideas enable row level security;
alter table spins enable row level security;
alter table settings enable row level security;

create policy "Public read ideas" on ideas
  for select using (true);

create policy "Public read spins" on spins
  for select using (true);

create policy "Public read settings" on settings
  for select using (true);

drop function if exists increment_pineapple(uuid);

-- Pineapple Leaderboard: village members and their pineapple counts.
-- Publicly viewable, but only the admin can change a count or the member list.
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#a8a29e',
  pineapple_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table members enable row level security;

create policy "Public read members" on members
  for select using (true);

insert into members (name, color, pineapple_count) values
  ('Moss', '#8fc1d1', 5),
  ('Quill', '#e0b23c', 4),
  ('Bram', '#a8a8a4', 4),
  ('Wren', '#9dc36b', 3),
  ('Tamar', '#6a8f3d', 3),
  ('Ivy', '#c9926a', 2),
  ('Cinder', '#8a8580', 2),
  ('Pip', '#8a5a34', 1)
on conflict (name) do nothing;
