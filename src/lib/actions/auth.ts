'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const locale = (formData.get('locale') as string) || 'da'

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
  const locale = (formData.get('locale') as string) || 'da'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: displayName },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(`/${locale}/auth/confirm`)
}

export async function logout(locale = 'da') {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(`/${locale}/auth/login`)
}

export async function loginWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/api/auth/callback',
    },
  })

  if (error) {
    return { error: error.message }
  }

  const url = data.url
  redirect(url)
}

export async function loginWithFacebook() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/api/auth/callback',
    },
  })

  if (error) {
    return { error: error.message }
  }

  const url = data.url
  redirect(url)
}
