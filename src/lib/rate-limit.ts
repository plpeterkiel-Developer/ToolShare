import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

/** Create a sliding-window rate limiter. Returns null when Redis is not configured. */
export function createRateLimiter(opts: {
  prefix: string
  limit: number
  window: Parameters<typeof Ratelimit.slidingWindow>[1]
}) {
  const r = getRedis()
  if (!r) return null
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(opts.limit, opts.window),
    prefix: `toolshare:${opts.prefix}`,
  })
}

/** Check rate limit. If Redis is unavailable or unconfigured, allows the request (fail-open). */
export async function rateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  if (!limiter) return { success: true, remaining: -1 }
  try {
    const result = await limiter.limit(identifier)
    return { success: result.success, remaining: result.remaining }
  } catch (err) {
    logger.warn('Rate limit check failed, allowing request', {
      error: err instanceof Error ? err.message : String(err),
    })
    return { success: true, remaining: -1 }
  }
}
