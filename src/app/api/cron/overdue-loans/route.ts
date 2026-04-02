import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend, EMAIL_FROM } from '@/lib/email/resend'
import { LoanOverdueEmail } from '@/lib/email/templates/loan-overdue'
import { logger } from '@/lib/logger'
import { rateLimit } from '@/lib/rate-limit'
import { cronLimiter } from '@/lib/rate-limiters'
import { routing } from '@/i18n/routing'

const DEFAULT_LOCALE = routing.defaultLocale

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET bearer token
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit the cron endpoint
  const { success } = await rateLimit(cronLimiter, 'cron-overdue')
  if (!success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
  }

  const adminSupabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const { data: overdueRequests, error } = await adminSupabase
    .from('borrow_requests')
    .select('id, borrower_id, owner_id, end_date, tool:tools(name)')
    .eq('status', 'approved')
    .lt('end_date', today)

  if (error) {
    logger.error('Failed to query overdue requests', { error: error.message })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!overdueRequests?.length) {
    return NextResponse.json({ processed: 0, message: 'No overdue loans found' })
  }

  // Update all to 'overdue' status
  const ids = overdueRequests.map((r) => r.id)
  const { error: updateError } = await adminSupabase
    .from('borrow_requests')
    .update({ status: 'overdue' })
    .in('id', ids)

  if (updateError) {
    logger.error('Failed to update overdue requests', { error: updateError.message })
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }

  // Send emails to both borrower and owner
  let emailsSent = 0
  const requestsUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${DEFAULT_LOCALE}/requests`

  for (const req of overdueRequests) {
    const toolName = (req.tool as { name: string } | null)?.name ?? 'Unknown tool'

    const [borrowerAuth, ownerAuth, borrowerProfile, ownerProfile] = await Promise.all([
      adminSupabase.auth.admin.getUserById(req.borrower_id),
      adminSupabase.auth.admin.getUserById(req.owner_id),
      adminSupabase.from('profiles').select('display_name').eq('id', req.borrower_id).single(),
      adminSupabase.from('profiles').select('display_name').eq('id', req.owner_id).single(),
    ])

    const recipients = [
      { email: borrowerAuth.data?.user?.email, name: borrowerProfile.data?.display_name },
      { email: ownerAuth.data?.user?.email, name: ownerProfile.data?.display_name },
    ]

    for (const recipient of recipients) {
      if (!recipient.email) continue
      try {
        await getResend().emails.send({
          from: EMAIL_FROM,
          to: recipient.email,
          subject: `Loan overdue: "${toolName}"`,
          react: LoanOverdueEmail({
            recipientName: recipient.name ?? 'there',
            toolName,
            endDate: req.end_date ?? '',
            requestsUrl,
          }),
        })
        emailsSent++
      } catch (err) {
        logger.warn('Failed to send overdue email', {
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
  }

  return NextResponse.json({
    processed: overdueRequests.length,
    emailsSent,
    timestamp: new Date().toISOString(),
  })
}
