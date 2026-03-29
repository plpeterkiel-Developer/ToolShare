'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { trackAction } from '@/lib/tracking'

export async function submitRating(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const requestId = formData.get('request_id') as string
  const rateeId = formData.get('ratee_id') as string
  const score = parseInt(formData.get('score') as string, 10)
  const comment = formData.get('comment') as string | null

  if (!requestId || !rateeId) return { error: 'Missing required fields' }
  if (isNaN(score) || score < 1 || score > 5) return { error: 'Score must be between 1 and 5' }

  trackAction('rating_submit', user.id, { score })

  // Verify the request is returned and user is a participant
  const { data: req } = await supabase
    .from('borrow_requests')
    .select('id, status, borrower_id, owner_id')
    .eq('id', requestId)
    .eq('status', 'returned')
    .single()

  if (!req) return { error: 'Request not found or not yet returned' }
  if (req.borrower_id !== user.id && req.owner_id !== user.id) {
    return { error: 'Not a participant in this loan' }
  }

  const { error } = await supabase.from('ratings').insert({
    request_id: requestId,
    rater_id: user.id,
    ratee_id: rateeId,
    score,
    comment: comment?.trim() || null,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You have already rated this loan' }
    return { error: error.message }
  }

  revalidatePath(`/profile/${rateeId}`)
  return { success: true }
}
