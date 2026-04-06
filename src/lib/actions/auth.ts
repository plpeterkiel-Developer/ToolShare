'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

const DEFAULT_LOCALE = routing.defaultLocale

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const locale = (formData.get('locale') as string) || DEFAULT_LOCALE

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect(`/${locale}`)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string
  const locale = (formData.get('locale') as string) || DEFAULT_LOCALE

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: displayName },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Supabase returns a fake success with empty identities for duplicate emails
  // (to prevent user enumeration when email confirmation is enabled)
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    return { error: 'emailAlreadyRegistered' }
  }

  redirect(`/${locale}/auth/confirm`)
}

export async function logout(locale: string = DEFAULT_LOCALE) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(`/${locale}/auth/login`)
}

export async function loginWithGoogle() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) return { error: 'OAuth is not configured. NEXT_PUBLIC_SITE_URL is missing.' }

  const supabase = await createClient()

  // Derive origin from the request so preview deployments redirect to their own
  // preview URL, not the hardcoded site URL (which would send the user to prod
  // on every preview login). Falls back to NEXT_PUBLIC_SITE_URL if headers are
  // unavailable (e.g. unusual proxy chain).
  const { headers } = await import('next/headers')
  const h = await headers()
  const fromHeader = h.get('origin') ?? h.get('referer')?.match(/^https?:\/\/[^/]+/)?.[0] ?? null
  const origin = fromHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  const url = data.url
  redirect(url)
}

export async function loginWithFacebook() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) return { error: 'OAuth is not configured. NEXT_PUBLIC_SITE_URL is missing.' }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: siteUrl + '/api/auth/callback',
    },
  })

  if (error) {
    return { error: error.message }
  }

  const url = data.url
  redirect(url)
}
