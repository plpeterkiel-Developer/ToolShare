-- Admin table: stores emails of users with admin privileges
create table public.admins (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz default now() not null
);

-- Seed default admin
insert into public.admins (email) values ('plpeterkiel@gmail.com');

-- RLS: only service role can access admins table
alter table public.admins enable row level security;
-- No public policies — admin table is only accessible via service role
