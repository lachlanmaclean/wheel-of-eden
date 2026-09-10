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
