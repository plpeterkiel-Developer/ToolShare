import { Resend } from 'resend'
import { isProd, isTest } from '@/lib/env'
import { logger } from '@/lib/logger'

let _resend: Resend | null = null

const DEFAULT_EMAIL_FROM = 'noreply@toolshare.local'

export const EMAIL_FROM = process.env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM

if (EMAIL_FROM === DEFAULT_EMAIL_FROM || EMAIL_FROM.endsWith('.local')) {
  logger.warn(
    `EMAIL_FROM is "${EMAIL_FROM}" — emails will be rejected by Resend in production. ` +
      'Set EMAIL_FROM to a verified domain.'
  )
}

export function getResend() {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      if (isProd) {
        throw new Error('RESEND_API_KEY is not set')
      }

      // Return a mock Resend client that logs emails instead of sending
      logger.info('RESEND_API_KEY not set — emails will be logged to console')
      return {
        emails: {
          send: async (payload: Record<string, unknown>) => {
            logger.info('Email suppressed (no API key)', {
              to: payload.to as string,
              subject: payload.subject as string,
              from: payload.from as string,
            })
            return { data: { id: 'dev-mock-id' }, error: null }
          },
        },
      } as unknown as Resend
    }

    _resend = new Resend(apiKey)
  }

  // In test environment without explicit API key, log instead of send
  if (isTest && !process.env.RESEND_API_KEY) {
    return {
      emails: {
        send: async (payload: Record<string, unknown>) => {
          logger.info('Email suppressed (test environment)', {
            to: payload.to as string,
            subject: payload.subject as string,
          })
          return { data: { id: 'test-mock-id' }, error: null }
        },
      },
    } as unknown as Resend
  }

  return _resend
}
