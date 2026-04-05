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

  const adminSupabase = createAdminClient()

  // Cancel active borrow requests where user is borrower or owner
  await adminSupabase
    .from('borrow_requests')
    .update({ status: 'cancelled' })
    .or(`borrower_id.eq.${user.id},owner_id.eq.${user.id}`)
    .in('status', ['pending', 'approved'])

  // Notify borrowers with active requests on tools this user owns
  const { data: affectedRequests } = await adminSupabase
    .from('borrow_requests')
    .select('borrower_id, tool:tools(name)')
    .eq('owner_id', user.id)
    .in('status', ['cancelled'])

  if (affectedRequests?.length) {
    const AccountDeletedEmail = (await import('@/lib/email/templates/account-deleted')).default
    for (const req of affectedRequests) {
      const { data: borrowerAuth } = await adminSupabase.auth.admin.getUserById(req.borrower_id)
      const { data: borrowerProfile } = await adminSupabase
        .from('profiles')
        .select('display_name')
        .eq('id', req.borrower_id)
        .single()
      const toolName = (req.tool as { name: string } | null)?.name ?? 'a tool'

      if (borrowerAuth?.user?.email) {
        await getResend().emails.send({
          from: EMAIL_FROM,
          to: borrowerAuth.user.email,
          subject: `Your request has been cancelled – ${toolName}`,
          react: AccountDeletedEmail({
            borrowerName: borrowerProfile?.display_name ?? 'User',
            toolName,
          }),
        })
      }
    }
  }

  // Mark erasure timestamp
  const { error } = await adminSupabase
    .from('profiles')
    .update({ gdpr_erasure_requested_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  // IMPORTANT — GDPR Article 17 compliance (right to erasure):
  // A scheduled job (Supabase Edge Function or pg_cron) MUST be deployed
  // before launch to process records where gdpr_erasure_requested_at is set.
  // The job should run daily and, for each flagged profile:
  //   1. Anonymise ratings (set rater display to "Deleted account")
  //   2. Delete all tools owned by the user
  //   3. Delete the user's profile row
  //   4. Delete the Supabase Auth user via admin.deleteUser()
  // Erasure must complete within 30 days of the request date.
  // See: https://gdpr-info.eu/art-17-gdpr/

  // Sign out the user
  await supabase.auth.signOut()

  revalidatePath('/profile')
  return { success: true }
}
