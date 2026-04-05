'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { routing } from '@/i18n/routing'
import type { ToolAvailability, ToolCondition } from '@/types/database.types'
import { trackAction } from '@/lib/tracking'
import { requireMembership } from '@/lib/admin'

const DEFAULT_LOCALE = routing.defaultLocale

export async function createTool(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Block suspended users
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_suspended')
    .eq('id', user.id)
    .single()
  if (profile?.is_suspended) return { error: 'Your account has been suspended' }

  // Soft gate: require community membership
  const membershipGuard = await requireMembership()
  if (membershipGuard) return membershipGuard

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const condition = (formData.get('condition') as ToolCondition) ?? 'good'
  const imageUrl = formData.get('image_url') as string | null
  const communityId = formData.get('community_id') as string | null
  const locale = (formData.get('locale') as string) || DEFAULT_LOCALE

  if (!name?.trim()) return { error: 'Name is required' }
  if (!category?.trim()) return { error: 'Category is required' }

  trackAction('tool_create', user.id, { category })

  // Validate community membership if a community is specified
  if (communityId) {
    const { data: membership } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('community_id', communityId)
      .eq('profile_id', user.id)
      .single()
    if (!membership) return { error: 'You are not a member of this community' }
  }

  const { data, error } = await supabase
    .from('tools')
    .insert({
      owner_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      category,
      condition,
      image_url: imageUrl || null,
      community_id: communityId || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/tools')
  return { success: true }
}

export async function updateTool(toolId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const condition = formData.get('condition') as ToolCondition
  const imageUrl = formData.get('image_url') as string | null
  const availability = formData.get('availability') as ToolAvailability
  const communityId = formData.get('community_id') as string | null
  const locale = (formData.get('locale') as string) || DEFAULT_LOCALE

  if (!name?.trim()) return { error: 'Name is required' }

  trackAction('tool_update', user.id, { toolId })

  // Validate community membership if a community is specified
  if (communityId) {
    const { data: membership } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('community_id', communityId)
      .eq('profile_id', user.id)
      .single()
    if (!membership) return { error: 'You are not a member of this community' }
  }

  const { error } = await supabase
    .from('tools')
    .update({
      name: name.trim(),
      description: description?.trim() || null,
      category,
      condition,
      image_url: imageUrl || null,
      availability: availability ?? 'available',
      community_id: communityId || null,
    })
    .eq('id', toolId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/tools/${toolId}`)
  revalidatePath('/tools')
  redirect(`/${locale}/tools/${toolId}`)
}

export async function deleteTool(toolId: string, locale: string = DEFAULT_LOCALE) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  trackAction('tool_delete', user.id, { toolId })

  // Check for active requests before deleting
  const { data: activeRequests } = await supabase
    .from('borrow_requests')
    .select('id')
    .eq('tool_id', toolId)
    .in('status', ['pending', 'approved'])
    .limit(1)

  if (activeRequests && activeRequests.length > 0) {
    return { error: 'Cannot delete — there is an active borrow request' }
  }

  const { error } = await supabase.from('tools').delete().eq('id', toolId).eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/tools')
  revalidatePath('/profile')
  redirect(`/${locale}/tools`)
}
