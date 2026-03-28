-- Add latitude/longitude columns to profiles for geo-based tool filtering.
-- The existing text "location" column remains for display; these new columns
-- power the "drop a pin + radius" proximity search.

alter table public.profiles
  add column latitude  double precision,
  add column longitude double precision;

-- Constrain values to valid WGS-84 ranges
alter table public.profiles
  add constraint profiles_latitude_range  check (latitude  between -90 and 90),
  add constraint profiles_longitude_range check (longitude between -180 and 180);

-- Index for fast bounding-box pre-filter
create index profiles_lat_lng on public.profiles (latitude, longitude)
  where latitude is not null and longitude is not null;

-- Haversine distance function (returns kilometres)
create or replace function public.haversine_km(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
) returns double precision
language sql immutable parallel safe as $$
  select 6371 * 2 * asin(sqrt(
    sin(radians(lat2 - lat1) / 2) ^ 2 +
    cos(radians(lat1)) * cos(radians(lat2)) *
    sin(radians(lng2 - lng1) / 2) ^ 2
  ))
$$;

-- RPC: return available tools within a given radius (km) of a point.
-- Accepts optional text search and category filter for composition with
-- the existing browse UI.
create or replace function public.tools_within_radius(
  p_lat       double precision,
  p_lng       double precision,
  p_radius_km double precision default 10,
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
