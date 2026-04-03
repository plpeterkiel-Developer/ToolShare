import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development'

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    tracesSampleRate: APP_ENV === 'production' ? 0.05 : APP_ENV === 'test' ? 0.1 : 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: APP_ENV === 'production' ? 1.0 : 0,
  })
}
