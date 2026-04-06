import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'
import { getResend, EMAIL_FROM } from '@/lib/email/resend'
import { logger } from '@/lib/logger'
import { AuthConfirmSignupEmail } from '@/lib/email/templates/auth-confirm-signup'
import { AuthMagicLinkEmail } from '@/lib/email/templates/auth-magic-link'
import { AuthResetPasswordEmail } from '@/lib/email/templates/auth-reset-password'

// Supabase Send Email Hook payload types
interface SendEmailHookPayload {
  user: {
    id: string
    email: string
    user_metadata?: { name?: string }
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: 'signup' | 'magiclink' | 'recovery' | 'invite' | 'email_change'
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

/**
 * Verify the standard-webhooks signature from Supabase Auth hooks.
 */
function verifyWebhookSignature(body: string, headers: Headers): boolean {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET
  if (!secret) {
    logger.warn('SEND_EMAIL_HOOK_SECRET not set — skipping signature verification')
    return process.env.NEXT_PUBLIC_APP_ENV !== 'production'
  }

  const webhookId = headers.get('webhook-id')
  const webhookTimestamp = headers.get('webhook-timestamp')
  const webhookSignature = headers.get('webhook-signature')

  if (!webhookId || !webhookTimestamp || !webhookSignature) return false

  // Reject timestamps older than 5 minutes to prevent replay attacks
  const now = Math.floor(Date.now() / 1000)
  const ts = parseInt(webhookTimestamp, 10)
  if (Math.abs(now - ts) > 300) return false

  // Secret format: "v1,whsec_<base64>" or just "whsec_<base64>"
  const rawSecret = secret.startsWith('v1,') ? secret.slice(3) : secret
  const secretBytes = Buffer.from(
    rawSecret.startsWith('whsec_') ? rawSecret.slice(6) : rawSecret,
    'base64'
  )

  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`
  const expectedSig = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64')

  // webhook-signature header contains space-separated "v1,<base64>" entries
  const signatures = webhookSignature.split(' ')
  return signatures.some((sig) => {
    const value = sig.startsWith('v1,') ? sig.slice(3) : sig
    return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(value))
  })
}

/**
 * Build the confirmation/action URL using token_hash (PKCE flow).
 */
function buildActionUrl(emailData: SendEmailHookPayload['email_data']): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || emailData.site_url || ''
  const base = siteUrl.replace(/\/$/, '')

  const typeMap: Record<string, string> = {
    signup: 'signup',
    magiclink: 'magiclink',
    recovery: 'recovery',
    invite: 'invite',
    email_change: 'email_change',
  }

  const type = typeMap[emailData.email_action_type] ?? emailData.email_action_type
  return `${base}/api/auth/callback?token_hash=${emailData.token_hash}&type=${type}&next=${encodeURIComponent(emailData.redirect_to || '/')}`
}

export async function POST(request: NextRequest) {
  let body: string
  try {
    body = await request.text()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!verifyWebhookSignature(body, request.headers)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: SendEmailHookPayload
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { user, email_data } = payload
  const actionUrl = buildActionUrl(email_data)

  try {
    const resend = getResend()

    switch (email_data.email_action_type) {
      case 'signup':
      case 'invite': {
        const { error: sendError } = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: 'Confirm your email – ToolShare',
          react: AuthConfirmSignupEmail({ confirmUrl: actionUrl }),
        })
        if (sendError) {
          throw new Error(`Resend error (${email_data.email_action_type}): ${sendError.message}`)
        }
        break
      }
      case 'magiclink': {
        const { error: sendError } = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: 'Your login link – ToolShare',
          react: AuthMagicLinkEmail({ magicLinkUrl: actionUrl }),
        })
        if (sendError) {
          throw new Error(`Resend error (magiclink): ${sendError.message}`)
        }
        break
      }
      case 'recovery': {
        const { error: sendError } = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: 'Reset your password – ToolShare',
          react: AuthResetPasswordEmail({ resetUrl: actionUrl }),
        })
        if (sendError) {
          throw new Error(`Resend error (recovery): ${sendError.message}`)
        }
        break
      }
      default: {
        logger.warn(`Unhandled email action type: ${email_data.email_action_type}`)
        // Fall through — Supabase will use default email if we don't send
      }
    }

    return NextResponse.json({})
  } catch (err) {
    logger.error('Send email hook failed', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
