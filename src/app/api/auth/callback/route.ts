import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Validate redirect target: must be a relative path (no open redirect)
  const rawNext = searchParams.get('next') ?? '/da'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/da'

  if (code || (tokenHash && type)) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Email confirmation / magic link / recovery (PKCE token_hash flow)
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      // verifyOtp may set session cookies even when returning an error —
      // check if the user is actually authenticated before showing an error
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    // OAuth / PKCE code exchange flow
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Extract locale from the validated next path, or fall back to default
  const locale = next.split('/')[1] || 'da'
  return NextResponse.redirect(`${origin}/${locale}/auth/login?error=auth_failed`)
}
