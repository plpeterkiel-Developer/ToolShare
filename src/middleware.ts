import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Routes that require authentication (after locale prefix)
const PROTECTED_PATHS = [
  '/tools/new',
  '/profile',
  '/requests',
  '/admin',
  '/onboarding',
  '/my-communities',
]

function isProtectedPath(pathname: string): boolean {
  // Strip locale prefix: /da/tools/new → /tools/new
  const withoutLocale = pathname.replace(/^\/(da|en)/, '') || '/'
  return (
    PROTECTED_PATHS.some((p) => withoutLocale === p || withoutLocale.startsWith(p + '/')) ||
    /^\/tools\/[^/]+\/edit$/.test(withoutLocale)
  )
}

export async function middleware(request: NextRequest) {
  // Skip intl middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 1. Run next-intl routing first
  const intlResponse = intlMiddleware(request)

  // 2. Supabase session refresh — must happen on every request
  const response = intlResponse ?? NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — this keeps the JWT alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 3. Protect routes
  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const loginUrl = new URL(`/${request.nextUrl.pathname.split('/')[1]}/auth/login`, request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Block suspended users from protected routes
  if (user && isProtectedPath(request.nextUrl.pathname)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_suspended')
      .eq('id', user.id)
      .single()

    if (profile?.is_suspended) {
      const locale = request.nextUrl.pathname.split('/')[1] || 'da'
      const loginUrl = new URL(`/${locale}/auth/login`, request.url)
      loginUrl.searchParams.set('error', 'suspended')
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
