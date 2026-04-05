'use server'

import { revalidatePath } from 'next/cache'
import { isCurrentUserAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend, EMAIL_FROM } from '@/lib/email/resend'
import { logger } from '@/lib/logger'
import UserWarningEmail from '@/lib/email/templates/user-warning'
import UserSuspendedEmail from '@/lib/email/templates/user-suspended'
import CommunityCreationApproved from '@/lib/email/templates/community-creation-approved'
import CommunityCreationDenied from '@/lib/email/templates/community-creation-denied'
import { getUser } from '@/lib/supabase/server'
import { routing } from '@/i18n/routing'

const ADMIN_DEFAULT_LOCALE = routing.defaultLocale
const ADMIN_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

async function requireAdmin() {
  const admin = await isCurrentUserAdmin()
  if (!admin) return { error: 'Not authorised' }
  return null
}

export async function suspendUser(userId: string, reason = 'Violation of community guidelines') {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single()

  const { error } = await supabase.from('profiles').update({ is_suspended: true }).eq('id', userId)

  if (error) return { error: error.message }

  // Send suspension email
  try {
    const { data: authUser } = await supabase.auth.admin.getUserById(userId)
    if (authUser?.user?.email) {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: authUser.user.email,
        subject: 'Your account has been suspended – ToolShare',
        react: UserSuspendedEmail({
          userName: profile?.display_name ?? 'User',
          reason,
        }),
      })
    }
  } catch (err) {
    logger.warn('Email notification failed (user suspended)', {
      error: err instanceof Error ? err.message : String(err),
    })
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function unsuspendUser(userId: string) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()
  const { error } = await supabase.from('profiles').update({ is_suspended: false }).eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function warnUser(userId: string, reason = 'Community guidelines violation') {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()

  // Get current warning count and email
  const { data: profile } = await supabase
    .from('profiles')
    .select('warning_count, display_name')
    .eq('id', userId)
    .single()

  if (!profile) return { error: 'User not found' }

  const { error } = await supabase
    .from('profiles')
    .update({ warning_count: profile.warning_count + 1 })
    .eq('id', userId)

  if (error) return { error: error.message }

  // Send warning email
  try {
    const { data: authUser } = await supabase.auth.admin.getUserById(userId)
    if (authUser?.user?.email) {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: authUser.user.email,
        subject: 'Warning from ToolShare',
        react: UserWarningEmail({
          userName: profile.display_name ?? 'User',
          reason,
        }),
      })
    }
  } catch (err) {
    logger.warn('Email notification failed (user warning)', {
      error: err instanceof Error ? err.message : String(err),
    })
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function resolveReport(reportId: string) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()
  const { error } = await supabase.from('reports').update({ resolved: true }).eq('id', reportId)

  if (error) return { error: error.message }

  revalidatePath('/admin/reports')
  return { success: true }
}

export async function adminDeleteTool(toolId: string) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()

  // Cancel any active requests first
  await supabase
    .from('borrow_requests')
    .update({ status: 'cancelled' })
    .eq('tool_id', toolId)
    .in('status', ['pending', 'approved'])

  const { error } = await supabase.from('tools').delete().eq('id', toolId)

  if (error) return { error: error.message }

  revalidatePath('/admin/tools')
  return { success: true }
}

// ── Community actions ────────────────────────────────────────────

export async function createCommunity(formData: FormData) {
  const denied = await requireAdmin()
  if (denied) return denied

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  if (!name?.trim()) return { error: 'Name is required' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('communities')
    .insert({ name: name.trim(), description: description?.trim() || null })

  if (error) return { error: error.message }

  revalidatePath('/admin/communities')
  return { success: true }
}

export async function updateCommunity(communityId: string, formData: FormData) {
  const denied = await requireAdmin()
  if (denied) return denied

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  if (!name?.trim()) return { error: 'Name is required' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('communities')
    .update({ name: name.trim(), description: description?.trim() || null })
    .eq('id', communityId)

  if (error) return { error: error.message }

  revalidatePath('/admin/communities')
  return { success: true }
}

export async function deleteCommunity(communityId: string) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()
  const { error } = await supabase.from('communities').delete().eq('id', communityId)

  if (error) return { error: error.message }

  revalidatePath('/admin/communities')
  revalidatePath('/tools')
  return { success: true }
}

export async function addCommunityMember(communityId: string, profileId: string) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('community_members')
    .insert({ community_id: communityId, profile_id: profileId })

  if (error) {
    if (error.code === '23505') return { error: 'User is already a member' }
    return { error: error.message }
  }

  revalidatePath(`/admin/communities/${communityId}`)
  revalidatePath('/admin/users')
  return { success: true }
}

export async function removeCommunityMember(communityId: string, profileId: string) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/communities/${communityId}`)
  return { success: true }
}

// ────────────────────────────────────────────────────────────────
// Community creation-request approval (super admin)
// ────────────────────────────────────────────────────────────────

export async function approveCommunityCreation(
  requestId: string,
  nameOverride?: string | null,
  descriptionOverride?: string | null
) {
  const denied = await requireAdmin()
  if (denied) return denied
  const currentUser = await getUser()
  if (!currentUser?.id) return { error: 'Not authenticated' }

  const supabase = createAdminClient()
  const { data: request } = await supabase
    .from('community_creation_requests')
    .select('id, requested_name, description, address, city, pickup_address, requested_by, status')
    .eq('id', requestId)
    .single()
  if (!request) return { error: 'Request not found' }
  if (request.status !== 'pending') return { error: 'Request is not pending' }

  const finalName = (nameOverride ?? request.requested_name).trim()
  const finalDescription = (descriptionOverride ?? request.description ?? '').trim() || null
  if (finalName.length < 2) return { error: 'Community name is too short' }

  // Create community
  const { data: community, error: createErr } = await supabase
    .from('communities')
    .insert({
      name: finalName,
      description: finalDescription,
      address: request.address,
      city: request.city,
    })
    .select('id, name')
    .single()
  if (createErr || !community) return { error: createErr?.message ?? 'Failed to create community' }

  // Mark request approved, link to resulting community
  await supabase
    .from('community_creation_requests')
    .update({
      status: 'approved',
      decided_at: new Date().toISOString(),
      decided_by: currentUser.id,
      resulting_community_id: community.id,
    })
    .eq('id', requestId)

  // Auto-add requester as member + community admin
  await supabase.from('community_members').upsert(
    {
      community_id: community.id,
      profile_id: request.requested_by,
      pickup_address: request.pickup_address,
    },
    { onConflict: 'community_id,profile_id' }
  )
  await supabase
    .from('community_admins')
    .upsert(
      { community_id: community.id, profile_id: request.requested_by },
      { onConflict: 'community_id,profile_id' }
    )

  // Notify requester
  try {
    const [{ data: profile }, { data: authLookup }] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', request.requested_by).single(),
      supabase.auth.admin.getUserById(request.requested_by),
    ])
    const requesterEmail = authLookup?.user?.email
    if (requesterEmail) {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: requesterEmail,
        subject: `${community.name} is live`,
        react: CommunityCreationApproved({
          requesterName: profile?.display_name ?? 'there',
          communityName: community.name,
          communityUrl: `${ADMIN_SITE_URL}/${ADMIN_DEFAULT_LOCALE}/admin/communities/${community.id}`,
        }),
      })
    }
  } catch (err) {
    logger.warn('Failed to send community-creation approved email', { err })
  }

  revalidatePath('/admin/community-requests')
  revalidatePath('/admin/communities')
  return { success: true, communityId: community.id }
}

export async function denyCommunityCreation(requestId: string, reason?: string | null) {
  const denied = await requireAdmin()
  if (denied) return denied
  const currentUser = await getUser()
  if (!currentUser?.id) return { error: 'Not authenticated' }

  const supabase = createAdminClient()
  const { data: request } = await supabase
    .from('community_creation_requests')
    .select('id, requested_name, requested_by, status')
    .eq('id', requestId)
    .single()
  if (!request) return { error: 'Request not found' }
  if (request.status !== 'pending') return { error: 'Request is not pending' }

  const { error: updateErr } = await supabase
    .from('community_creation_requests')
    .update({
      status: 'denied',
      decided_at: new Date().toISOString(),
      decided_by: currentUser.id,
      decision_reason: reason?.trim() || null,
    })
    .eq('id', requestId)
  if (updateErr) return { error: updateErr.message }

  try {
    const [{ data: profile }, { data: authLookup }] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', request.requested_by).single(),
      supabase.auth.admin.getUserById(request.requested_by),
    ])
    const requesterEmail = authLookup?.user?.email
    if (requesterEmail) {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: requesterEmail,
        subject: `Community request update: ${request.requested_name}`,
        react: CommunityCreationDenied({
          requesterName: profile?.display_name ?? 'there',
          requestedName: request.requested_name,
          reason: reason?.trim() || null,
        }),
      })
    }
  } catch (err) {
    logger.warn('Failed to send community-creation denied email', { err })
  }

  revalidatePath('/admin/community-requests')
  return { success: true }
}

// ────────────────────────────────────────────────────────────────
// Community admin assignments (super admin)
// ────────────────────────────────────────────────────────────────

export async function addCommunityAdmin(communityId: string, profileId: string) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('community_admins')
    .upsert(
      { community_id: communityId, profile_id: profileId },
      { onConflict: 'community_id,profile_id' }
    )
  if (error) return { error: error.message }

  // Ensure they are also a member
  await supabase
    .from('community_members')
    .upsert(
      { community_id: communityId, profile_id: profileId },
      { onConflict: 'community_id,profile_id' }
    )

  revalidatePath(`/admin/communities/${communityId}`)
  return { success: true }
}

export async function removeCommunityAdmin(communityId: string, profileId: string) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('community_admins')
    .delete()
    .eq('community_id', communityId)
    .eq('profile_id', profileId)
  if (error) return { error: error.message }

  revalidatePath(`/admin/communities/${communityId}`)
  return { success: true }
}
