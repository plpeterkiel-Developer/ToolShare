import { createClient } from '@/lib/supabase/server'

export async function getRatingsForUser(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ratings')
    .select('*, rater:profiles!rater_id(id, display_name, avatar_url)')
    .eq('ratee_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getAverageRating(userId: string): Promise<number | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('ratings').select('score').eq('ratee_id', userId)

  if (error || !data || data.length === 0) return null

  const avg = data.reduce((sum, r) => sum + r.score, 0) / data.length
  return Math.round(avg * 10) / 10
}

export async function hasUserRatedRequest(requestId: string, raterId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('ratings')
    .select('id')
    .eq('request_id', requestId)
    .eq('rater_id', raterId)
    .maybeSingle()

  return !!data
}
