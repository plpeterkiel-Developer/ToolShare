import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDev } from '@/lib/env'
import { logger } from '@/lib/logger'
import type { Json } from '@/types/database.types'

/**
 * Deferred page view tracking. Runs after the response is sent.
 */
export function trackPageView(pagePath: string, eventName: string, userId?: string | null) {
  after(async () => {
    try {
      if (isDev) {
        logger.debug('Track page view', { pagePath, eventName, userId })
      }
      const supabase = await createClient()
      await supabase.from('usage_events').insert({
        event_type: 'page_view',
        event_name: eventName,
        page_path: pagePath,
        user_id: userId ?? null,
      })
    } catch (err) {
      logger.warn('Tracking page view failed', {
        eventName,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })
}

/**
 * Deferred action tracking. Runs after the response is sent.
 */
export function trackAction(
  eventName: string,
  userId?: string | null,
  metadata?: Record<string, Json>
) {
  after(async () => {
    try {
      if (isDev) {
        logger.debug('Track action', { eventName, userId, metadata })
      }
      const supabase = await createClient()
      await supabase.from('usage_events').insert({
        event_type: 'action',
        event_name: eventName,
        user_id: userId ?? null,
        metadata: metadata ?? {},
      })
    } catch (err) {
      logger.warn('Tracking action failed', {
        eventName,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })
}
