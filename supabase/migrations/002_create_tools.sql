create type tool_condition as enum ('good', 'fair', 'worn');
create type tool_availability as enum ('available', 'on_loan', 'unavailable');

create table public.tools (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  description   text,
  category      text not null,
  condition     tool_condition not null default 'good',
  image_url     text,
  availability  tool_availability not null default 'available',
  -- Full-text search vector (name + description), auto-updated by PostgreSQL
  search_vector tsvector generated always as (
    to_tsvector('english', name || ' ' || coalesce(description, ''))
  ) stored,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index tools_owner_id_idx    on public.tools(owner_id);
create index tools_category_idx    on public.tools(category);
create index tools_availability_idx on public.tools(availability);
create index tools_search_idx       on public.tools using gin(search_vector);

create trigger tools_updated_at
  before update on public.tools
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.tools enable row level security;

-- Anyone (including guests) can browse tools
create policy "tools_public_read"
  on public.tools for select
  using (true);

create policy "tools_owner_insert"
  on public.tools for insert
  with check (auth.uid() = owner_id);

create policy "tools_owner_update"
  on public.tools for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "tools_owner_delete"
  on public.tools for delete
  using (auth.uid() = owner_id);
