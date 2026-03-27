'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { login, loginWithGoogle, loginWithFacebook } from '@/lib/actions/auth'

export interface LoginFormProps {
  next?: string
  initialError?: string
}

export function LoginForm({ initialError }: LoginFormProps) {
  const [error, setError] = useState<string | undefined>(initialError)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setOauthLoading('google')
    const result = await loginWithGoogle()
    if (result?.error) {
      setError(result.error)
      setOauthLoading(null)
    }
  }

  async function handleFacebook() {
    setOauthLoading('facebook')
    const result = await loginWithFacebook()
    if (result?.error) {
      setError(result.error)
      setOauthLoading(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Log in to ToolShare</h1>

      {error && (
        <div
          role="alert"
          data-testid="error-message"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          required
          data-testid="email-input"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          data-testid="password-input"
        />
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          data-testid="login-submit"
          className="w-full"
        >
          Log in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <hr className="flex-1 border-gray-200" />
        <span className="text-xs text-gray-400 uppercase tracking-wider">Or continue with</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="secondary"
          loading={oauthLoading === 'google'}
          disabled={oauthLoading !== null}
          onClick={handleGoogle}
          data-testid="google-login-button"
          className="w-full"
          aria-label="Continue with Google"
        >
          <GoogleIcon />
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="secondary"
          loading={oauthLoading === 'facebook'}
          disabled={oauthLoading !== null}
          onClick={handleFacebook}
          data-testid="facebook-login-button"
          className="w-full"
          aria-label="Continue with Facebook"
        >
          <FacebookIcon />
          Continue with Facebook
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link
          href="signup"
          className="font-medium text-green-700 hover:text-green-800 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill="#1877F2"
      />
    </svg>
  )
}
