# Communities & onboarding

ToolShare is organised around **communities** — trusted neighbourhood groups that tools can optionally be scoped to. This document covers the data model, user flows, and admin hierarchy.

## Data model

| Table                         | Purpose                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `communities`                 | Named groups (id, name, description).                                                                                     |
| `community_members`           | Join table `(community_id, profile_id)` — a user can belong to many communities.                                          |
| `community_admins`            | Join table `(community_id, profile_id)` — per-community administrators.                                                   |
| `community_join_requests`     | Users requesting to join a community (pending → approved / denied / cancelled). Unique-pending index prevents duplicates. |
| `community_creation_requests` | Users requesting that a new community be created (pending → approved / denied).                                           |
| `admins`                      | Platform super admins, keyed by email.                                                                                    |

See `supabase/migrations/011_create_communities.sql` and `supabase/migrations/014_community_onboarding.sql` for the schema and RLS policies.

## Admin hierarchy

- **Super admin** — entries in the `admins` table (by email). Manages the whole platform: creates/approves communities, assigns community admins, all `/admin/*` pages.
- **Community admin** — entries in `community_admins`. Manages a specific community: approves join requests, views members. Accesses `/communities/[id]/manage`.

A user can be a super admin, a community admin (of one or many communities), both, or neither.

## Soft gate

A user with **zero** `community_members` rows can still browse public tools (`community_id IS NULL`) but cannot:

- post a new tool (`tools_owner_insert` RLS requires membership)
- create a borrow request (`requests_borrower_insert` RLS requires membership)

The `requireMembership()` guard in `src/lib/admin.ts` enforces this at the server-action layer too.

## User flow — join a community

1. New user signs up → lands on homepage → sees onboarding banner ("Join a community to start sharing tools").
2. Clicks CTA → `/[locale]/onboarding`.
3. Types in the search box → debounced search via `searchCommunitiesAction`.
4. Clicks "Request to join" → creates `community_join_requests` row (status `pending`).
5. All community admins for that community receive an email (subject: _New join request for …_).
6. Community admin opens `/communities/[id]/manage` → approves or denies.
7. Requester receives an email with the outcome; on approve, they're added to `community_members`.

## User flow — request a new community

1. User searches on `/onboarding` → no matches.
2. Expands "Can't find your community?" → fills out name + description → submits.
3. Creates `community_creation_requests` row; all super admins receive an email.
4. Super admin opens `/admin/community-requests` → edits the name/description (optional) → approves.
5. Approval creates the `communities` row, adds the requester as both member and community admin, and emails them.

## Relevant code

**Server actions** (`src/lib/actions/`):

- `communities.ts` — `requestJoinCommunity`, `cancelJoinRequest`, `requestNewCommunity`, `approveJoinRequest`, `denyJoinRequest`, `searchCommunitiesAction`
- `admin.ts` — `approveCommunityCreation`, `denyCommunityCreation`, `addCommunityAdmin`, `removeCommunityAdmin`

**Queries** (`src/lib/queries/communities.ts`):

- `getUserCommunities`, `getUserCommunityIds`, `searchCommunities`
- `getUserPendingJoinRequests`, `getUserCreationRequests`
- `getCommunityJoinRequests`, `getAllCommunityCreationRequests`, `getCommunityAdminsWithProfiles`
- `countPendingCreationRequests`

**Auth helpers** (`src/lib/admin.ts`):

- `isCurrentUserAdmin` (super admin check)
- `isCommunityAdmin`, `getCurrentUserCommunityAdminships`, `getCurrentUserCommunityMemberships`
- `requireCommunityAdmin` (super admin OR community admin of given community)
- `requireMembership` (user has ≥1 community)

**UI**:

- `/[locale]/onboarding` — search + request flows
- `/[locale]/my-communities` — user's memberships + pending requests + per-community manage links
- `/[locale]/communities/[id]/manage` — community admin page
- `/[locale]/admin/communities/[id]` — super admin view (includes join requests + admins management)
- `/[locale]/admin/community-requests` — super admin review of creation requests

**Email templates** (`src/lib/email/templates/`):

- `community-join-requested` → to community admins
- `community-join-approved` / `community-join-denied` → to requester
- `community-creation-requested` → to super admins
- `community-creation-approved` / `community-creation-denied` → to requester
