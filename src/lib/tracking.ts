import { createClient } from '@/lib/supabase/server'
import { isDev } from '@/lib/env'
import { logger } from '@/lib/logger'
import type { Json } from '@/types/database.types'

/**
 * Fire-and-forget page view tracking. Call from server page components.
 */
export function trackPageView(pagePath: string, eventName: string, userId?: string | null) {
  void (async () => {
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
  })()
}

/**
 * Fire-and-forget action tracking. Call from server actions.
 */
export function trackAction(
  eventName: string,
  userId?: string | null,
  metadata?: Record<string, Json>
) {
  void (async () => {
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
  })()
}
