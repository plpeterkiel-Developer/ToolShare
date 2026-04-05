import { createRateLimiter } from '@/lib/rate-limit'

/** General API routes: 60 requests per minute */
export const apiLimiter = createRateLimiter({ prefix: 'api', limit: 60, window: '1m' })

/** Auth actions (login attempts): 5 per minute */
export const authLimiter = createRateLimiter({ prefix: 'auth', limit: 5, window: '1m' })

/** Borrow request creation: 10 per hour */
export const borrowLimiter = createRateLimiter({ prefix: 'borrow', limit: 10, window: '1h' })

/** Cron endpoint: 2 per minute */
export const cronLimiter = createRateLimiter({ prefix: 'cron', limit: 2, window: '1m' })
