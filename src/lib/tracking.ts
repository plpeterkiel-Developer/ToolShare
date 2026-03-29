import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database.types'

/**
 * Fire-and-forget page view tracking. Call from server page components.
 */
export function trackPageView(pagePath: string, eventName: string, userId?: string | null) {
  void (async () => {
    try {
      const supabase = await createClient()
      await supabase.from('usage_events').insert({
        event_type: 'page_view',
        event_name: eventName,
        page_path: pagePath,
        user_id: userId ?? null,
      })
    } catch {
      // Tracking must never break the page
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
      const supabase = await createClient()
      await supabase.from('usage_events').insert({
        event_type: 'action',
        event_name: eventName,
        user_id: userId ?? null,
        metadata: metadata ?? {},
      })
    } catch {
      // Tracking must never break the action
    }
  })()
}
