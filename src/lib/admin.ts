import { getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getUser()

  if (!user?.email) return false

  const adminClient = createAdminClient()
  const { data } = await adminClient.from('admins').select('id').eq('email', user.email).single()

  return !!data
}

/** Returns true if `profileId` is a community admin for `communityId`. */
export async function isCommunityAdmin(profileId: string, communityId: string): Promise<boolean> {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('community_admins')
    .select('community_id')
    .eq('profile_id', profileId)
    .eq('community_id', communityId)
    .maybeSingle()
  return !!data
}

/** Returns community IDs the current user admins (empty array if none / not logged in). */
export async function getCurrentUserCommunityAdminships(): Promise<string[]> {
  const user = await getUser()
  if (!user?.id) return []
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('community_admins')
    .select('community_id')
    .eq('profile_id', user.id)
  return (data ?? []).map((row) => row.community_id)
}

/** Returns community IDs the current user is an approved member of. */
export async function getCurrentUserCommunityMemberships(): Promise<string[]> {
  const user = await getUser()
  if (!user?.id) return []
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('community_members')
    .select('community_id')
    .eq('profile_id', user.id)
  return (data ?? []).map((row) => row.community_id)
}

/**
 * Guard: require the current user to be a super admin OR a community admin
 * of `communityId`. Returns null on success, or an error object.
 */
export async function requireCommunityAdmin(
  communityId: string
): Promise<{ error: string } | null> {
  const user = await getUser()
  if (!user?.id) return { error: 'Not authenticated' }
  if (await isCurrentUserAdmin()) return null
  if (await isCommunityAdmin(user.id, communityId)) return null
  return { error: 'Not authorised' }
}

/**
 * Guard: require the current user to have at least one approved community
 * membership. Used to gate tool creation + borrow requests (soft gate).
 */
export async function requireMembership(): Promise<{ error: string } | null> {
  const user = await getUser()
  if (!user?.id) return { error: 'Not authenticated' }
  const memberships = await getCurrentUserCommunityMemberships()
  if (memberships.length === 0) {
    return { error: 'You must join a community before you can do this' }
  }
  return null
}
