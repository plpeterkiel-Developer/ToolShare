import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Community } from '@/types/database.types'

export async function getUserCommunities(userId: string): Promise<Community[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('community_members')
    .select('community:communities(*)')
    .eq('profile_id', userId)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => (row as unknown as { community: Community }).community)
}

export async function getUserCommunityIds(userId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('profile_id', userId)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row: { community_id: string }) => row.community_id)
}

// ────────────────────────────────────────────────────────────────
// Search & discovery
// ────────────────────────────────────────────────────────────────

/** Case-insensitive name search on communities. Returns up to `limit` matches. */
export async function searchCommunities(query: string, limit = 10): Promise<Community[]> {
  const supabase = await createClient()
  const trimmed = query.trim()

  let q = supabase.from('communities').select('*').order('name').limit(limit)
  if (trimmed.length > 0) {
    // Escape % and _ to avoid unintended wildcards
    const safe = trimmed.replace(/[%_]/g, '\\$&')
    q = q.ilike('name', `%${safe}%`)
  }

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data ?? []
}

// ────────────────────────────────────────────────────────────────
// User's own join/creation requests (RLS-protected)
// ────────────────────────────────────────────────────────────────

export interface JoinRequestWithCommunity {
  id: string
  community_id: string
  status: string
  message: string | null
  created_at: string
  community: Pick<Community, 'id' | 'name'>
}

export async function getUserPendingJoinRequests(
  userId: string
): Promise<JoinRequestWithCommunity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_join_requests')
    .select('id, community_id, status, message, created_at, community:communities(id, name)')
    .eq('profile_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as JoinRequestWithCommunity[]
}

export interface CreationRequestRow {
  id: string
  requested_name: string
  description: string | null
  status: string
  decision_reason: string | null
  created_at: string
  resulting_community_id: string | null
}

export async function getUserCreationRequests(userId: string): Promise<CreationRequestRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_creation_requests')
    .select(
      'id, requested_name, description, status, decision_reason, created_at, resulting_community_id'
    )
    .eq('requested_by', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as CreationRequestRow[]
}

// ────────────────────────────────────────────────────────────────
// Community admin / super admin views (service-role client)
// ────────────────────────────────────────────────────────────────

export interface CommunityJoinRequestAdminRow {
  id: string
  community_id: string
  status: string
  message: string | null
  created_at: string
  decided_at: string | null
  profile: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

/** Community admin view of join requests for a specific community. */
export async function getCommunityJoinRequests(
  communityId: string,
  status: 'pending' | 'approved' | 'denied' | 'cancelled' | 'all' = 'pending'
): Promise<CommunityJoinRequestAdminRow[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('community_join_requests')
    .select(
      'id, community_id, status, message, created_at, decided_at, profile:profiles!community_join_requests_profile_id_fkey(id, display_name, avatar_url)'
    )
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as CommunityJoinRequestAdminRow[]
}

export interface CreationRequestAdminRow {
  id: string
  requested_name: string
  description: string | null
  status: string
  decision_reason: string | null
  created_at: string
  decided_at: string | null
  resulting_community_id: string | null
  requester: {
    id: string
    display_name: string | null
  } | null
}

/** Super-admin view of all community creation requests. */
export async function getAllCommunityCreationRequests(
  status: 'pending' | 'approved' | 'denied' | 'cancelled' | 'all' = 'pending'
): Promise<CreationRequestAdminRow[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('community_creation_requests')
    .select(
      'id, requested_name, description, status, decision_reason, created_at, decided_at, resulting_community_id, requester:profiles!community_creation_requests_requested_by_fkey(id, display_name)'
    )
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as CreationRequestAdminRow[]
}

export interface CommunityAdminWithProfile {
  community_id: string
  profile_id: string
  created_at: string
  profile: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

/** Super-admin view of admins for a specific community. */
export async function getCommunityAdminsWithProfiles(
  communityId: string
): Promise<CommunityAdminWithProfile[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('community_admins')
    .select(
      'community_id, profile_id, created_at, profile:profiles!community_admins_profile_id_fkey(id, display_name, avatar_url)'
    )
    .eq('community_id', communityId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as CommunityAdminWithProfile[]
}

/** Fetch user emails (auth) for a set of profile ids. Returns map { profileId: email }. */
export async function getEmailsForProfiles(
  profileIds: string[]
): Promise<Map<string, string | null>> {
  if (profileIds.length === 0) return new Map()
  const supabase = createAdminClient()
  const { data } = await supabase.auth.admin.listUsers()
  const wanted = new Set(profileIds)
  const map = new Map<string, string | null>()
  for (const u of data?.users ?? []) {
    if (wanted.has(u.id)) map.set(u.id, u.email ?? null)
  }
  return map
}
