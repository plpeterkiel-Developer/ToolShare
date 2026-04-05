-- Per-community pickup addresses: a user may have a different handoff point
-- in each community they belong to. Stored on community_members; captured on
-- the request rows so it can be copied across when admins approve.

alter table public.community_members
  add column pickup_address text;

alter table public.community_join_requests
  add column pickup_address text;

alter table public.community_creation_requests
  add column pickup_address text;
