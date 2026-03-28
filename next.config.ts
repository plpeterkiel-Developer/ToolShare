import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.sentry-cdn.com",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} https://images.unsplash.com https://*.tile.openstreetmap.org https://unpkg.com`,
      "font-src 'self'",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} https://o*.ingest.sentry.io https://*.tile.openstreetmap.org`,
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [
            {
              protocol: 'https' as const,
              hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
              pathname: '/storage/v1/object/public/**',
            },
          ]
        : []),
      {
        protocol: 'https' as const,
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
