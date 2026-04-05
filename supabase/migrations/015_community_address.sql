-- Community address: local communities/foreninger typically have a physical
-- location. Store it on both the request (for admin review) and the final
-- community row (for display in tools/members UIs).

alter table public.communities
  add column address text;

alter table public.community_creation_requests
  add column address text;
