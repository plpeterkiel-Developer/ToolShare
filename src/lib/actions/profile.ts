'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const displayName = formData.get('display_name') as string
  const location = formData.get('location') as string | null
  const pickupAddress = formData.get('pickup_address') as string | null
  const bio = formData.get('bio') as string | null
  const avatarUrl = formData.get('avatar_url') as string | null
  const latStr = formData.get('latitude') as string | null
  const lngStr = formData.get('longitude') as string | null

  if (!displayName?.trim()) return { error: 'Display name is required' }

  const latitude = latStr ? parseFloat(latStr) : null
  const longitude = lngStr ? parseFloat(lngStr) : null

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName.trim(),
      location: location?.trim() || null,
      latitude: latitude != null && !isNaN(latitude) ? latitude : null,
      longitude: longitude != null && !isNaN(longitude) ? longitude : null,
      pickup_address: pickupAddress?.trim() || null,
      bio: bio?.trim() || null,
      avatar_url: avatarUrl || null,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}
