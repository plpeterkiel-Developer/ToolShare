import { createAdminClient } from '@/lib/supabase/admin'
import type { Community, Profile } from '@/types/database.types'

export async function getAdminDashboardStats() {
  const supabase = createAdminClient()

  const [users, tools, activeLoans, openReports] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('tools').select('id', { count: 'exact', head: true }),
    supabase
      .from('borrow_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['approved']),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('resolved', false),
  ])

  return {
    totalUsers: users.count ?? 0,
    totalTools: tools.count ?? 0,
    activeLoans: activeLoans.count ?? 0,
    openReports: openReports.count ?? 0,
  }
}

export async function getAllUsers() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Fetch emails from auth for each user
  const usersWithEmail = await Promise.all(
    (data ?? []).map(async (profile) => {
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
      return {
        ...profile,
        email: authUser?.user?.email ?? null,
      }
    })
  )

  return usersWithEmail
}

export async function getAllTools() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tools')
    .select('*, owner:profiles!owner_id(id, display_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllReports() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('reports')
    .select(
      '*, reporter:profiles!reporter_id(id, display_name), reported_user:profiles!reported_user_id(id, display_name), reported_tool:tools!reported_tool_id(id, name)'
    )
    .order('resolved', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllRequests() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('borrow_requests')
    .select(
      '*, tool:tools(id, name), borrower:profiles!borrower_id(id, display_name), owner:profiles!owner_id(id, display_name)'
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── Community queries ────────────────────────────────────────────

export async function getAllCommunities() {
  const supabase = createAdminClient()

  const { data: communities, error } = await supabase
    .from('communities')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Get member counts per community
  const communityIds = (communities ?? []).map((c: Community) => c.id)
  if (communityIds.length === 0) return []

  const { data: memberships } = await supabase
    .from('community_members')
    .select('community_id')
    .in('community_id', communityIds)

  const countMap = new Map<string, number>()
  for (const m of (memberships ?? []) as { community_id: string }[]) {
    countMap.set(m.community_id, (countMap.get(m.community_id) ?? 0) + 1)
  }

  return (communities ?? []).map((c: Community) => ({
    ...c,
    member_count: countMap.get(c.id) ?? 0,
  }))
}

export async function getCommunityById(id: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.from('communities').select('*').eq('id', id).single()

  if (error) return null
  return data as Community
}

export async function getCommunityMembers(communityId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('community_members')
    .select('profile_id, joined_at, profile:profiles!profile_id(id, display_name)')
    .eq('community_id', communityId)
    .order('joined_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    profile_id: row.profile_id,
    joined_at: row.joined_at,
    profile: row.profile as unknown as Pick<Profile, 'id' | 'display_name'>,
  }))
}

export async function getAllUsersForMemberSelect() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .order('display_name', { ascending: true })

  if (error) throw error
  return data ?? []
}
