'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const type = formData.get('type') as string
  const message = (formData.get('message') as string)?.trim()

  if (!type || !['feedback', 'bug', 'suggestion'].includes(type)) {
    return { error: 'Invalid feedback type' }
  }
  if (!message) return { error: 'Message is required' }

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    type,
    message,
  })

  if (error) return { error: error.message }

  return { success: true }
}
