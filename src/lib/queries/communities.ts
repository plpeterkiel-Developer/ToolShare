import { createClient } from '@/lib/supabase/server'
import type { Community } from '@/types/database.types'

export async function getUserCommunities(userId: string): Promise<Community[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('community_members')
    .select('community:communities(*)')
    .eq('profile_id', userId)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => (row as unknown as { community: Community }).community)
}

export async function getUserCommunityIds(userId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('profile_id', userId)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row: { community_id: string }) => row.community_id)
}
