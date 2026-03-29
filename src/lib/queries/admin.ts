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

  const [{ data, error }, { data: authData }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.auth.admin.listUsers(),
  ])

  if (error) throw error

  // Build email lookup map from batch auth fetch (avoids N+1 queries)
  const emailMap = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? null]))

  return (data ?? []).map((profile) => ({
    ...profile,
    email: emailMap.get(profile.id) ?? null,
  }))
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

// ── Usage analytics ─────────────────────────────────────────────

export interface UsageEventRow {
  event_type: string
  event_name: string
  page_path: string | null
}

export interface UsageStats {
  topPages: { event_name: string; page_path: string; count: number }[]
  topActions: { event_name: string; count: number }[]
  totalEvents: number
}

// Navigation depth map — how many clicks from home each page is
const PAGE_DEPTH: Record<string, number> = {
  home: 0,
  tools_browse: 1,
  about: 1,
  faq: 1,
  feedback_page: 1,
  requests: 1,
  profile: 1,
  tool_detail: 2,
  tool_create_page: 2,
  profile_public: 2,
  gdpr: 2,
  tool_edit_page: 3,
}

export function getPageDepth(eventName: string): number {
  return PAGE_DEPTH[eventName] ?? -1
}

export async function getUsageAnalytics(days = 30): Promise<UsageStats> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const { data, error } = await supabase
    .from('usage_events')
    .select('event_type, event_name, page_path')
    .gte('created_at', since)

  if (error) throw error

  const rows = (data ?? []) as UsageEventRow[]

  // Aggregate page views
  const pageMap = new Map<string, { page_path: string; count: number }>()
  const actionMap = new Map<string, number>()

  for (const row of rows) {
    if (row.event_type === 'page_view') {
      const existing = pageMap.get(row.event_name)
      if (existing) {
        existing.count++
      } else {
        pageMap.set(row.event_name, { page_path: row.page_path ?? '', count: 1 })
      }
    } else if (row.event_type === 'action') {
      actionMap.set(row.event_name, (actionMap.get(row.event_name) ?? 0) + 1)
    }
  }

  const topPages = Array.from(pageMap.entries())
    .map(([event_name, { page_path, count }]) => ({ event_name, page_path, count }))
    .sort((a, b) => b.count - a.count)

  const topActions = Array.from(actionMap.entries())
    .map(([event_name, count]) => ({ event_name, count }))
    .sort((a, b) => b.count - a.count)

  return { topPages, topActions, totalEvents: rows.length }
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
