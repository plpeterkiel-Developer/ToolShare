-- Add a per-user search radius preference (km) used when filtering tools by
-- proximity on the browse page. Default is 2 km.

alter table public.profiles
  add column search_radius double precision not null default 2;

alter table public.profiles
  add constraint profiles_search_radius_range check (search_radius between 0.5 and 50);

-- Update the RPC default to match the new 2 km default
create or replace function public.tools_within_radius(
  p_lat       double precision,
  p_lng       double precision,
  p_radius_km double precision default 2,
  p_search    text            default null,
  p_category  text            default null,
  p_limit     int             default 24,
  p_offset    int             default 0
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
  distance_km  double precision
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
    public.haversine_km(p_lat, p_lng, p.latitude, p.longitude) as distance_km
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
    -- optional text search
    and (p_search is null or t.search_vector @@ plainto_tsquery('english', p_search))
    -- optional category
    and (p_category is null or t.category = p_category)
  order by distance_km, t.created_at desc
  limit p_limit
  offset p_offset
$$;
