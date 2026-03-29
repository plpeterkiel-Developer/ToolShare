'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend, EMAIL_FROM } from '@/lib/email/resend'
import GdprExport from '@/lib/email/templates/gdpr-export'

export async function downloadMyData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Collect all user data (usage_events requires admin client due to RLS)
  const adminSupabase = createAdminClient()
  const [profileResult, toolsResult, requestsResult, ratingsResult, usageResult] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, location, bio, avatar_url, created_at')
        .eq('id', user.id)
        .single(),
      supabase.from('tools').select('*').eq('owner_id', user.id),
      supabase
        .from('borrow_requests')
        .select('*')
        .or(`borrower_id.eq.${user.id},owner_id.eq.${user.id}`),
      supabase.from('ratings').select('*').eq('rater_id', user.id),
      adminSupabase
        .from('usage_events')
        .select('event_type, event_name, page_path, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ])

  const exportData = {
    profile: profileResult.data,
    tools: toolsResult.data ?? [],
    borrow_requests: requestsResult.data ?? [],
    ratings_given: ratingsResult.data ?? [],
    usage_events: usageResult.data ?? [],
    exported_at: new Date().toISOString(),
  }

  const exportJson = JSON.stringify(exportData, null, 2)

  try {
    await getResend().emails.send({
      from: EMAIL_FROM,
      to: user.email!,
      subject: 'Your ToolShare data export',
      react: GdprExport({
        userName: profileResult.data?.display_name ?? user.email ?? 'User',
        exportJson,
      }),
    })
  } catch {
    return { error: 'Failed to send export email. Please try again.' }
  }

  return { success: true }
}

export async function requestErasure() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ gdpr_erasure_requested_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  // In a real deployment, a scheduled job checks gdpr_erasure_requested_at
  // and anonymises the account within 30 days.

  revalidatePath('/profile')
  return { success: true }
}
