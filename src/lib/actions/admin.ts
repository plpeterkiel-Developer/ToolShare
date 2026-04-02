'use server'

import { revalidatePath } from 'next/cache'
import { isCurrentUserAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend, EMAIL_FROM } from '@/lib/email/resend'
import UserWarningEmail from '@/lib/email/templates/user-warning'
import UserSuspendedEmail from '@/lib/email/templates/user-suspended'

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
