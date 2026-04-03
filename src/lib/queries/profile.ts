import { createClient, getUser } from '@/lib/supabase/server'
import type { PublicProfile } from '@/types/database.types'

export async function getProfile(id: string): Promise<PublicProfile | null> {
  const supabase = await createClient()

  // Deliberately exclude pickup_address — it must never be exposed to the client
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, display_name, location, bio, avatar_url, is_suspended, warning_count, gdpr_erasure_requested_at, last_active_at, created_at, updated_at, test_run_id'
    )
    .eq('id', id)
    .single()

  if (error) return null
  return data as PublicProfile
}

export async function getCurrentUser() {
  return getUser()
}
