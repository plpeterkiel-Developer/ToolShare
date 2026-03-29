export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs')
    const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development'

    if (dsn) {
      Sentry.init({
        dsn,
        environment: appEnv,
        tracesSampleRate: appEnv === 'production' ? 0.2 : appEnv === 'test' ? 0.1 : 0,
      })
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export async function onRequestError(
  error: unknown,
  request: { path: string; method: string; headers: Record<string, string | string[] | undefined> },
  context: { routerKind: string; routePath: string; routeType: string }
) {
  const { captureRequestError } = await import('@sentry/nextjs')
  captureRequestError(error, request, context)
}
