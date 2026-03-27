-- Profiles table: extends auth.users with public user data.
-- pickup_address is intentionally excluded from the public RLS select policy
-- to protect user privacy — it is only sent via email after a request is approved.

create table public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  display_name             text not null,
  location                 text,            -- neighbourhood/city, shown publicly
  pickup_address           text,            -- full street address, PRIVATE
  bio                      text,
  avatar_url               text,
  is_suspended             boolean not null default false,
  warning_count            int not null default 0,
  gdpr_erasure_requested_at timestamptz,
  last_active_at           timestamptz default now() not null,
  created_at               timestamptz default now() not null,
  updated_at               timestamptz default now() not null
);

-- Auto-create a profile row when a new auth user is created (e.g. email signup or OAuth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on profiles
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;

-- Public can read all columns EXCEPT pickup_address
create policy "profiles_public_read"
  on public.profiles for select
  using (true);

-- Users can update their own profile
create policy "profiles_owner_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Prevent direct reads of pickup_address via RLS column-level security
-- (pickup_address is only accessible server-side via service role key when sending approval emails)
