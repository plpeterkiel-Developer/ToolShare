'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { searchCommunities as searchCommunitiesQuery } from '@/lib/queries/communities'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend, EMAIL_FROM } from '@/lib/email/resend'
import { isCommunityAdmin } from '@/lib/admin'
import { logger } from '@/lib/logger'
import { routing } from '@/i18n/routing'
import CommunityJoinRequested from '@/lib/email/templates/community-join-requested'
import CommunityJoinApproved from '@/lib/email/templates/community-join-approved'
import CommunityJoinDenied from '@/lib/email/templates/community-join-denied'
import CommunityCreationRequested from '@/lib/email/templates/community-creation-requested'

const DEFAULT_LOCALE = routing.defaultLocale
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// ───────────────────────────────────────────────────────────────
// User-facing actions
// ───────────────────────────────────────────────────────────────

export async function searchCommunitiesAction(query: string) {
  try {
    const results = await searchCommunitiesQuery(query, 10)
    return { success: true, results }
  } catch (err) {
    logger.warn('Search communities failed', { err })
    return { error: 'Search failed' }
  }
}

export async function requestJoinCommunity(
  communityId: string,
  message?: string | null,
  pickupAddress?: string | null
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Reject if already a member
  const { data: existingMembership } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('community_id', communityId)
    .eq('profile_id', user.id)
    .maybeSingle()
  if (existingMembership) return { error: 'You are already a member of this community' }

  // Reject if a pending request already exists
  const { data: existingPending } = await supabase
    .from('community_join_requests')
    .select('id')
    .eq('community_id', communityId)
    .eq('profile_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()
  if (existingPending) return { error: 'You already have a pending request for this community' }

  const trimmedPickup = pickupAddress?.trim() || null
  if (trimmedPickup && trimmedPickup.length > 255) {
    return { error: 'Pickup address is too long' }
  }

  const { data: request, error } = await supabase
    .from('community_join_requests')
    .insert({
      community_id: communityId,
      profile_id: user.id,
      message: message?.trim() || null,
      pickup_address: trimmedPickup,
    })
    .select('id')
    .single()
  if (error || !request) return { error: error?.message ?? 'Failed to create request' }

  // Email community admins (best-effort)
  try {
    const adminDb = createAdminClient()
    const [{ data: community }, { data: admins }, { data: requesterProfile }] = await Promise.all([
      adminDb.from('communities').select('id, name').eq('id', communityId).single(),
      adminDb.from('community_admins').select('profile_id').eq('community_id', communityId),
      adminDb.from('profiles').select('display_name').eq('id', user.id).single(),
    ])
    if (community && admins && admins.length > 0) {
      const adminUrl = `${SITE_URL}/${DEFAULT_LOCALE}/communities/${communityId}/manage`
      await Promise.all(
        admins.map(async (admin) => {
          const [authLookup, profileLookup] = await Promise.all([
            adminDb.auth.admin.getUserById(admin.profile_id),
            adminDb.from('profiles').select('display_name').eq('id', admin.profile_id).single(),
          ])
          const email = authLookup.data?.user?.email
          if (!email) return
          await getResend().emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: `New join request for ${community.name}`,
            react: CommunityJoinRequested({
              adminName: profileLookup.data?.display_name ?? 'Community admin',
              communityName: community.name,
              requesterName: requesterProfile?.display_name ?? 'A user',
              requesterEmail: user.email ?? '',
              message: message?.trim() || null,
              adminUrl,
            }),
          })
        })
      )
    }
  } catch (err) {
    logger.warn('Failed to send community join-request email', { err })
  }

  revalidatePath(`/${DEFAULT_LOCALE}/onboarding`)
  return { success: true, requestId: request.id }
}

export async function cancelJoinRequest(requestId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('community_join_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .eq('profile_id', user.id)
    .eq('status', 'pending')
  if (error) return { error: error.message }

  revalidatePath(`/${DEFAULT_LOCALE}/onboarding`)
  return { success: true }
}

export async function requestNewCommunity(
  name: string,
  description?: string | null,
  address?: string | null,
  city?: string | null,
  pickupAddress?: string | null
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const trimmedName = name.trim()
  if (trimmedName.length < 2) return { error: 'Community name is too short' }
  if (trimmedName.length > 100) return { error: 'Community name is too long' }
  const trimmedAddress = address?.trim() || null
  if (trimmedAddress && trimmedAddress.length > 255) {
    return { error: 'Address is too long' }
  }
  const trimmedCity = city?.trim() || null
  if (trimmedCity && trimmedCity.length > 100) {
    return { error: 'City is too long' }
  }
  const trimmedPickup = pickupAddress?.trim() || null
  if (trimmedPickup && trimmedPickup.length > 255) {
    return { error: 'Pickup address is too long' }
  }

  const { data: request, error } = await supabase
    .from('community_creation_requests')
    .insert({
      requested_name: trimmedName,
      description: description?.trim() || null,
      address: trimmedAddress,
      city: trimmedCity,
      pickup_address: trimmedPickup,
      requested_by: user.id,
    })
    .select('id')
    .single()
  if (error || !request) return { error: error?.message ?? 'Failed to submit request' }

  // Notify super admins
  try {
    const adminDb = createAdminClient()
    const [{ data: superAdmins }, { data: requesterProfile }] = await Promise.all([
      adminDb.from('admins').select('email'),
      adminDb.from('profiles').select('display_name').eq('id', user.id).single(),
    ])
    const adminUrl = `${SITE_URL}/${DEFAULT_LOCALE}/admin/community-requests`
    for (const admin of superAdmins ?? []) {
      if (!admin.email) continue
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: admin.email,
        subject: `New community requested: ${trimmedName}`,
        react: CommunityCreationRequested({
          adminName: 'Super admin',
          requesterName: requesterProfile?.display_name ?? 'A user',
          requesterEmail: user.email ?? '',
          requestedName: trimmedName,
          description: description?.trim() || null,
          address: trimmedAddress,
          city: trimmedCity,
          pickupAddress: trimmedPickup,
          adminUrl,
        }),
      })
    }
  } catch (err) {
    logger.warn('Failed to send community-creation email', { err })
  }

  revalidatePath(`/${DEFAULT_LOCALE}/onboarding`)
  return { success: true, requestId: request.id }
}

// ───────────────────────────────────────────────────────────────
// Community-admin actions
// ───────────────────────────────────────────────────────────────

export async function approveJoinRequest(requestId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminDb = createAdminClient()
  const { data: request } = await adminDb
    .from('community_join_requests')
    .select('id, community_id, profile_id, status, pickup_address')
    .eq('id', requestId)
    .single()
  if (!request) return { error: 'Request not found' }
  if (request.status !== 'pending') return { error: 'Request is not pending' }

  const guard = await isCommunityAdmin(user.id, request.community_id)
  if (!guard) return { error: 'Not authorised' }

  // Update request + insert membership
  const { error: updateErr } = await adminDb
    .from('community_join_requests')
    .update({ status: 'approved', decided_at: new Date().toISOString(), decided_by: user.id })
    .eq('id', requestId)
  if (updateErr) return { error: updateErr.message }

  const { error: memberErr } = await adminDb.from('community_members').upsert(
    {
      community_id: request.community_id,
      profile_id: request.profile_id,
      pickup_address: request.pickup_address,
    },
    { onConflict: 'community_id,profile_id' }
  )
  if (memberErr) return { error: memberErr.message }

  // Notify requester
  try {
    const [{ data: community }, { data: profile }, { data: authLookup }] = await Promise.all([
      adminDb.from('communities').select('id, name').eq('id', request.community_id).single(),
      adminDb.from('profiles').select('display_name').eq('id', request.profile_id).single(),
      adminDb.auth.admin.getUserById(request.profile_id),
    ])
    const requesterEmail = authLookup?.user?.email
    if (community && requesterEmail) {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: requesterEmail,
        subject: `Welcome to ${community.name}`,
        react: CommunityJoinApproved({
          requesterName: profile?.display_name ?? 'there',
          communityName: community.name,
          communityUrl: `${SITE_URL}/${DEFAULT_LOCALE}/tools`,
        }),
      })
    }
  } catch (err) {
    logger.warn('Failed to send join-approved email', { err })
  }

  revalidatePath(`/${DEFAULT_LOCALE}/admin/communities/${request.community_id}`)
  return { success: true }
}

export async function denyJoinRequest(requestId: string, reason?: string | null) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminDb = createAdminClient()
  const { data: request } = await adminDb
    .from('community_join_requests')
    .select('id, community_id, profile_id, status')
    .eq('id', requestId)
    .single()
  if (!request) return { error: 'Request not found' }
  if (request.status !== 'pending') return { error: 'Request is not pending' }

  const guard = await isCommunityAdmin(user.id, request.community_id)
  if (!guard) return { error: 'Not authorised' }

  const { error: updateErr } = await adminDb
    .from('community_join_requests')
    .update({ status: 'denied', decided_at: new Date().toISOString(), decided_by: user.id })
    .eq('id', requestId)
  if (updateErr) return { error: updateErr.message }

  // Notify requester
  try {
    const [{ data: community }, { data: profile }, { data: authLookup }] = await Promise.all([
      adminDb.from('communities').select('id, name').eq('id', request.community_id).single(),
      adminDb.from('profiles').select('display_name').eq('id', request.profile_id).single(),
      adminDb.auth.admin.getUserById(request.profile_id),
    ])
    const requesterEmail = authLookup?.user?.email
    if (community && requesterEmail) {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: requesterEmail,
        subject: `Join request update: ${community.name}`,
        react: CommunityJoinDenied({
          requesterName: profile?.display_name ?? 'there',
          communityName: community.name,
          reason: reason?.trim() || null,
        }),
      })
    }
  } catch (err) {
    logger.warn('Failed to send join-denied email', { err })
  }

  revalidatePath(`/${DEFAULT_LOCALE}/admin/communities/${request.community_id}`)
  return { success: true }
}
