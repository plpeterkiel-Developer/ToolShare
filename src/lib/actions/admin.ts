'use server'

import { revalidatePath } from 'next/cache'
import { isCurrentUserAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const admin = await isCurrentUserAdmin()
  if (!admin) return { error: 'Not authorised' }
  return null
}

export async function suspendUser(userId: string) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()
  const { error } = await supabase.from('profiles').update({ is_suspended: true }).eq('id', userId)

  if (error) return { error: error.message }

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

export async function warnUser(userId: string) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createAdminClient()

  // Get current warning count
  const { data: profile } = await supabase
    .from('profiles')
    .select('warning_count')
    .eq('id', userId)
    .single()

  if (!profile) return { error: 'User not found' }

  const { error } = await supabase
    .from('profiles')
    .update({ warning_count: profile.warning_count + 1 })
    .eq('id', userId)

  if (error) return { error: error.message }

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
