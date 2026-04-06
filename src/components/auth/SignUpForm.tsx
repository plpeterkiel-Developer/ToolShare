'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { signup } from '@/lib/actions/auth'

export function SignUpForm() {
  const locale = useLocale()
  const t = useTranslations('auth.signup')
  const tErrors = useTranslations('auth.errors')
  const [error, setError] = useState<string | undefined>()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setFieldErrors({})

    const form = e.currentTarget
    const formData = new FormData(form)

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: tErrors('passwordMismatch') })
      return
    }

    setLoading(true)

    // Pass display_name via the expected field name
    formData.set('displayName', formData.get('display_name') as string)
    formData.set('locale', locale)

    const result = await signup(formData)
    if (result?.error) {
      const translated = tErrors.has(result.error) ? tErrors(result.error) : result.error
      setError(translated)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 sm:p-10">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">{t('heading')}</h1>

      {error && (
        <div
          role="alert"
          data-testid="error-message"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="display_name"
          name="display_name"
          type="text"
          label={t('displayName')}
          autoComplete="name"
          required
          data-testid="display-name-input"
          error={fieldErrors.display_name}
        />
        <Input
          id="email"
          name="email"
          type="email"
          label={t('emailLabel')}
          autoComplete="email"
          required
          data-testid="email-input"
          error={fieldErrors.email}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label={t('password')}
          autoComplete="new-password"
          required
          minLength={6}
          data-testid="password-input"
          error={fieldErrors.password}
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label={t('confirmPassword')}
          autoComplete="new-password"
          required
          data-testid="confirm-password-input"
          error={fieldErrors.confirmPassword}
        />
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          data-testid="register-submit"
          className="w-full"
        >
          {t('submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        {t('hasAccount')}{' '}
        <Link
          href="login"
          className="font-medium text-green-800 hover:text-green-900 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 rounded"
        >
          {t('loginLink')}
        </Link>
      </p>
    </div>
  )
}

export default SignUpForm
