-- Communities feature: trusted groups for tool lending restrictions.
-- Users can belong to multiple communities; tools can optionally be
-- restricted to a single community (NULL = visible to everyone).

-- ──────────────────────────────────────────────────────────────────
-- 1. communities table
-- ──────────────────────────────────────────────────────────────────
create table public.communities (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  created_at  timestamptz not null default now()
);

alter table public.communities enable row level security;

-- Anyone authenticated can read communities (needed for tool form selectors)
create policy "communities_select_authenticated"
  on public.communities for select
  to authenticated
  using (true);

-- Only service-role (admin client) can insert/update/delete
-- No explicit policies for insert/update/delete → denied by default for
-- anon and authenticated roles. Admin actions use the service-role client.

-- ──────────────────────────────────────────────────────────────────
-- 2. community_members join table
-- ──────────────────────────────────────────────────────────────────
create table public.community_members (
  community_id uuid        not null references public.communities(id) on delete cascade,
  profile_id   uuid        not null references public.profiles(id)    on delete cascade,
  joined_at    timestamptz not null default now(),
  primary key (community_id, profile_id)
);

create index community_members_profile_id_idx on public.community_members (profile_id);

alter table public.community_members enable row level security;

-- Users can read their own memberships
create policy "community_members_select_own"
  on public.community_members for select
  to authenticated
  using (profile_id = auth.uid());

-- Admins manage membership via service-role client (no extra policies needed).

-- ──────────────────────────────────────────────────────────────────
-- 3. Add community_id to tools
-- ──────────────────────────────────────────────────────────────────
alter table public.tools
  add column community_id uuid references public.communities(id) on delete set null;

create index tools_community_id_idx on public.tools (community_id)
  where community_id is not null;

-- ──────────────────────────────────────────────────────────────────
-- 4. Update tools_within_radius() to respect community restrictions
-- ──────────────────────────────────────────────────────────────────
create or replace function public.tools_within_radius(
  p_lat       double precision,
  p_lng       double precision,
  p_radius_km double precision default 10,
  p_search    text            default null,
  p_category  text            default null,
  p_limit     int             default 24,
  p_offset    int             default 0,
  p_user_id   uuid            default null
)
returns table (
  id           uuid,
  owner_id     uuid,
  name         text,
  description  text,
  category     text,
  condition    text,
  image_url    text,
  availability text,
  created_at   timestamptz,
  updated_at   timestamptz,
  test_run_id  text,
  distance_km  double precision,
  community_id uuid
)
language sql stable
as $$
  select
    t.id,
    t.owner_id,
    t.name,
    t.description,
    t.category,
    t.condition::text,
    t.image_url,
    t.availability::text,
    t.created_at,
    t.updated_at,
    t.test_run_id,
    public.haversine_km(p_lat, p_lng, p.latitude, p.longitude) as distance_km,
    t.community_id
  from public.tools t
  join public.profiles p on p.id = t.owner_id
  where t.availability = 'available'
    and p.latitude  is not null
    and p.longitude is not null
    -- bounding-box pre-filter (rough, fast)
    and p.latitude  between p_lat - (p_radius_km / 111.0)
                        and p_lat + (p_radius_km / 111.0)
    and p.longitude between p_lng - (p_radius_km / (111.0 * cos(radians(p_lat))))
                        and p_lng + (p_radius_km / (111.0 * cos(radians(p_lat))))
    -- exact haversine filter
    and public.haversine_km(p_lat, p_lng, p.latitude, p.longitude) <= p_radius_km
    -- community restriction: show tool if public OR user is a member
    and (
      t.community_id is null
      or t.community_id in (
        select cm.community_id from public.community_members cm
        where cm.profile_id = p_user_id
      )
    )
    -- optional text search
    and (p_search is null or t.search_vector @@ plainto_tsquery('english', p_search))
    -- optional category
    and (p_category is null or t.category = p_category)
  order by distance_km, t.created_at desc
  limit p_limit
  offset p_offset
$$;
