'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getResend, EMAIL_FROM } from '@/lib/email/resend'
import RequestReceived from '@/lib/email/templates/request-received'
import RequestApproved from '@/lib/email/templates/request-approved'
import RequestDenied from '@/lib/email/templates/request-denied'
import RequestCancelled from '@/lib/email/templates/request-cancelled'
import { trackAction } from '@/lib/tracking'
import { logger } from '@/lib/logger'
import { rateLimit } from '@/lib/rate-limit'
import { borrowLimiter } from '@/lib/rate-limiters'
import { routing } from '@/i18n/routing'

const DEFAULT_LOCALE = routing.defaultLocale

export async function createBorrowRequest(formData: FormData) {
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

  const { success: withinLimit } = await rateLimit(borrowLimiter, user.id)
  if (!withinLimit) return { error: 'Too many requests. Please try again later.' }

  const toolId = formData.get('tool_id') as string
  const message = formData.get('message') as string | null
  const startDate = formData.get('start_date') as string | null
  const endDate = formData.get('end_date') as string | null

  if (startDate && endDate && endDate < startDate) {
    return { error: 'End date must be on or after start date' }
  }

  trackAction('borrow_request_create', user.id, { toolId })

  // Get tool to find owner
  const { data: tool } = await supabase
    .from('tools')
    .select('id, name, owner_id, availability, community_id')
    .eq('id', toolId)
    .single()

  if (!tool) return { error: 'Tool not found' }
  if (tool.owner_id === user.id) return { error: 'Cannot request your own tool' }
  if (tool.availability !== 'available') return { error: 'Tool is not available' }

  // Verify community membership if tool is restricted
  if (tool.community_id) {
    const { data: membership } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('community_id', tool.community_id)
      .eq('profile_id', user.id)
      .single()
    if (!membership) return { error: 'This tool is restricted to community members' }
  }

  const { data: request, error } = await supabase
    .from('borrow_requests')
    .insert({
      tool_id: toolId,
      borrower_id: user.id,
      owner_id: tool.owner_id,
      message: message?.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Send notification email to owner
  try {
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', tool.owner_id)
      .single()
    const { data: borrowerProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
    const { data: ownerAuthUser } = await supabase.auth.admin.getUserById(tool.owner_id)

    if (ownerAuthUser?.user?.email) {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: ownerAuthUser.user.email,
        subject: `New borrow request for "${tool.name}"`,
        react: RequestReceived({
          ownerName: ownerProfile?.display_name ?? 'there',
          borrowerName: borrowerProfile?.display_name ?? 'Someone',
          toolName: tool.name,
          startDate: startDate ?? '',
          endDate: endDate ?? '',
          message: message ?? '',
          requestsUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${DEFAULT_LOCALE}/requests`,
        }),
      })
    }
  } catch (err) {
    logger.warn('Email notification failed (request created)', {
      error: err instanceof Error ? err.message : String(err),
    })
  }

  revalidatePath('/requests')
  return { success: true, requestId: request.id }
}

export async function approveRequest(requestId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  trackAction('borrow_request_approve', user.id, { requestId })

  // Fetch request + tool + borrower profile + owner pickup address (service role needed for pickup_address)
  const { data: req } = await supabase
    .from('borrow_requests')
    .select(
      '*, tool:tools(name), borrower:profiles!borrower_id(display_name), owner:profiles!owner_id(display_name, pickup_address)'
    )
    .eq('id', requestId)
    .eq('owner_id', user.id)
    .single()

  if (!req) return { error: 'Request not found or not authorised' }
  if (req.status !== 'pending') return { error: 'Request is no longer pending' }

  const { error } = await supabase
    .from('borrow_requests')
    .update({ status: 'approved' })
    .eq('id', requestId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  // Send approval email with pickup address to borrower
  try {
    const { data: borrowerAuthUser } = await supabase.auth.admin.getUserById(req.borrower_id)
    if (borrowerAuthUser?.user?.email) {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: borrowerAuthUser.user.email,
        subject: `Your request for "${(req.tool as { name: string })?.name}" has been approved`,
        react: RequestApproved({
          borrowerName: (req.borrower as { display_name: string })?.display_name ?? 'there',
          ownerName: (req.owner as { display_name: string })?.display_name ?? 'the owner',
          toolName: (req.tool as { name: string })?.name ?? '',
          startDate: req.start_date ?? '',
          endDate: req.end_date ?? '',
          pickupAddress:
            (req.owner as { pickup_address: string | null })?.pickup_address ??
            'Contact the owner for pick-up details',
          requestsUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${DEFAULT_LOCALE}/requests`,
        }),
      })
    }
  } catch (err) {
    logger.warn('Email notification failed (request approved)', {
      error: err instanceof Error ? err.message : String(err),
    })
  }

  revalidatePath('/requests')
  return { success: true }
}

export async function denyRequest(requestId: string, reason?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  trackAction('borrow_request_deny', user.id, { requestId })

  const { data: req } = await supabase
    .from('borrow_requests')
    .select('*, tool:tools(name), borrower:profiles!borrower_id(display_name)')
    .eq('id', requestId)
    .eq('owner_id', user.id)
    .single()

  if (!req) return { error: 'Request not found or not authorised' }

  const { error } = await supabase
    .from('borrow_requests')
    .update({ status: 'denied' })
    .eq('id', requestId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  // Email borrower
  try {
    const { data: borrowerAuthUser } = await supabase.auth.admin.getUserById(req.borrower_id)
    if (borrowerAuthUser?.user?.email) {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: borrowerAuthUser.user.email,
        subject: `Your request for "${(req.tool as { name: string })?.name}" was not approved`,
        react: RequestDenied({
          borrowerName: (req.borrower as { display_name: string })?.display_name ?? 'there',
          toolName: (req.tool as { name: string })?.name ?? '',
          reason: reason ?? '',
        }),
      })
    }
  } catch (err) {
    logger.warn('Email notification failed (request denied)', {
      error: err instanceof Error ? err.message : String(err),
    })
  }

  revalidatePath('/requests')
  return { success: true }
}

export async function cancelRequest(requestId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  trackAction('borrow_request_cancel', user.id, { requestId })

  const { data: req } = await supabase
    .from('borrow_requests')
    .select('*, tool:tools(name), owner:profiles!owner_id(display_name)')
    .eq('id', requestId)
    .eq('borrower_id', user.id)
    .eq('status', 'pending')
    .single()

  if (!req) return { error: 'Request not found, not authorised, or not pending' }

  const { error } = await supabase
    .from('borrow_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .eq('borrower_id', user.id)

  if (error) return { error: error.message }

  // Email owner
  try {
    const { data: borrowerProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
    const { data: ownerAuthUser } = await supabase.auth.admin.getUserById(req.owner_id)
    if (ownerAuthUser?.user?.email) {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: ownerAuthUser.user.email,
        subject: `Borrow request for "${(req.tool as { name: string })?.name}" was cancelled`,
        react: RequestCancelled({
          ownerName: (req.owner as { display_name: string })?.display_name ?? 'there',
          borrowerName: borrowerProfile?.display_name ?? 'The borrower',
          toolName: (req.tool as { name: string })?.name ?? '',
        }),
      })
    }
  } catch (err) {
    logger.warn('Email notification failed (request cancelled)', {
      error: err instanceof Error ? err.message : String(err),
    })
  }

  revalidatePath('/requests')
  return { success: true }
}

export async function markReturned(requestId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  trackAction('borrow_request_return', user.id, { requestId })

  const { error } = await supabase
    .from('borrow_requests')
    .update({ status: 'returned' })
    .eq('id', requestId)
    .eq('owner_id', user.id)
    .in('status', ['approved', 'overdue'])

  if (error) return { error: error.message }

  revalidatePath('/requests')
  return { success: true }
}
