-- Community onboarding + hierarchical admin roles
-- Adds per-community admins, join-request workflow, and community-creation
-- requests. Soft-gate: users with no approved community membership cannot
-- post tools or create borrow requests.

-- ──────────────────────────────────────────────────────────────────
-- 1. community_admins table
--    Per-community administrators (separate from super admins by email
--    in the `admins` table). A user may admin multiple communities.
-- ──────────────────────────────────────────────────────────────────
create table public.community_admins (
  community_id uuid        not null references public.communities(id) on delete cascade,
  profile_id   uuid        not null references public.profiles(id)    on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (community_id, profile_id)
);

create index community_admins_profile_id_idx on public.community_admins (profile_id);

alter table public.community_admins enable row level security;

-- A user can read their own admin rows (to know which communities they admin)
create policy "community_admins_select_own"
  on public.community_admins for select
  to authenticated
  using (profile_id = auth.uid());

-- Modifications only via service-role client (super admin actions).

-- ──────────────────────────────────────────────────────────────────
-- 2. community_request_status enum (shared by join + creation requests)
-- ──────────────────────────────────────────────────────────────────
create type community_request_status as enum ('pending', 'approved', 'denied', 'cancelled');

-- ──────────────────────────────────────────────────────────────────
-- 3. community_join_requests table
-- ──────────────────────────────────────────────────────────────────
create table public.community_join_requests (
  id            uuid                      primary key default gen_random_uuid(),
  community_id  uuid                      not null references public.communities(id) on delete cascade,
  profile_id    uuid                      not null references public.profiles(id)    on delete cascade,
  status        community_request_status  not null default 'pending',
  message       text,
  created_at    timestamptz               not null default now(),
  decided_at    timestamptz,
  decided_by    uuid references public.profiles(id) on delete set null
);

create index community_join_requests_community_id_idx on public.community_join_requests (community_id);
create index community_join_requests_profile_id_idx   on public.community_join_requests (profile_id);
create index community_join_requests_status_idx       on public.community_join_requests (status);

-- Prevent duplicate pending requests for the same (community, user)
create unique index community_join_requests_one_pending_per_user
  on public.community_join_requests (community_id, profile_id)
  where status = 'pending';

alter table public.community_join_requests enable row level security;

-- Requester sees their own requests
create policy "cjr_select_own"
  on public.community_join_requests for select
  to authenticated
  using (profile_id = auth.uid());

-- Community admins see requests for communities they admin
create policy "cjr_select_admin"
  on public.community_join_requests for select
  to authenticated
  using (
    exists (
      select 1 from public.community_admins ca
      where ca.community_id = community_join_requests.community_id
        and ca.profile_id   = auth.uid()
    )
  );

-- Requester inserts their own request (status defaults to 'pending')
create policy "cjr_insert_own"
  on public.community_join_requests for insert
  to authenticated
  with check (profile_id = auth.uid() and status = 'pending');

-- Requester may cancel their own pending request
create policy "cjr_update_own_cancel"
  on public.community_join_requests for update
  to authenticated
  using (profile_id = auth.uid() and status = 'pending')
  with check (profile_id = auth.uid() and status = 'cancelled');

-- Approvals/denials performed by service-role client (community admin action).

-- ──────────────────────────────────────────────────────────────────
-- 4. community_creation_requests table
-- ──────────────────────────────────────────────────────────────────
create table public.community_creation_requests (
  id                     uuid                      primary key default gen_random_uuid(),
  requested_name         text                      not null,
  description            text,
  requested_by           uuid                      not null references public.profiles(id) on delete cascade,
  status                 community_request_status  not null default 'pending',
  decision_reason        text,
  created_at             timestamptz               not null default now(),
  decided_at             timestamptz,
  decided_by             uuid                      references public.profiles(id) on delete set null,
  resulting_community_id uuid                      references public.communities(id) on delete set null
);

create index community_creation_requests_status_idx       on public.community_creation_requests (status);
create index community_creation_requests_requested_by_idx on public.community_creation_requests (requested_by);

alter table public.community_creation_requests enable row level security;

-- Requester sees their own creation requests
create policy "ccr_select_own"
  on public.community_creation_requests for select
  to authenticated
  using (requested_by = auth.uid());

-- Requester inserts their own creation request
create policy "ccr_insert_own"
  on public.community_creation_requests for insert
  to authenticated
  with check (requested_by = auth.uid() and status = 'pending');

-- Super-admin list/approve/deny via service-role client.

-- ──────────────────────────────────────────────────────────────────
-- 5. Soft gate: tighten insert policies to require community membership
--    Users with zero community memberships may browse but not post.
-- ──────────────────────────────────────────────────────────────────

-- Tools: require the poster to have at least one community_members row.
drop policy if exists "tools_owner_insert" on public.tools;
create policy "tools_owner_insert"
  on public.tools for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.community_members cm
      where cm.profile_id = auth.uid()
    )
  );

-- Borrow requests: require the borrower to have at least one community_members row.
drop policy if exists "requests_borrower_insert" on public.borrow_requests;
create policy "requests_borrower_insert"
  on public.borrow_requests for insert
  to authenticated
  with check (
    auth.uid() = borrower_id
    and auth.uid() != owner_id
    and exists (
      select 1 from public.community_members cm
      where cm.profile_id = auth.uid()
    )
  );
