-- Split community address: capture city separately from street address.
-- `address` (migration 015) now holds street + number only; `city` is new.

alter table public.communities
  add column city text;

alter table public.community_creation_requests
  add column city text;
