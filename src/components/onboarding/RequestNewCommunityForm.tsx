'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { requestNewCommunity } from '@/lib/actions/communities'

export function RequestNewCommunityForm() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = await requestNewCommunity(name, description || null, address || null)
    setSubmitting(false)
    if ('error' in res && res.error) {
      setError(res.error)
      return
    }
    setSuccess(true)
    setName('')
    setDescription('')
    setAddress('')
    startTransition(() => router.refresh())
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="open-request-new-community"
        className="inline-flex w-full items-center justify-center rounded-lg border border-green-700 bg-white px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 sm:w-auto"
      >
        {t('addCommunityCta')}
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-stone-200 bg-stone-50 p-4"
    >
      <div>
        <h3 className="text-base font-semibold text-stone-900">{t('requestNewTitle')}</h3>
        <p className="mt-1 text-sm text-stone-600">{t('requestNewDescription')}</p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">{t('requestNewNameLabel')}</span>
        <input
          type="text"
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('requestNewNamePlaceholder')}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 text-base focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          data-testid="new-community-name"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">{t('requestNewAddressLabel')}</span>
        <input
          type="text"
          maxLength={255}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('requestNewAddressPlaceholder')}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 text-base focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          data-testid="new-community-address"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">{t('requestNewDescLabel')}</span>
        <textarea
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('requestNewDescPlaceholder')}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 text-base focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          data-testid="new-community-description"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-green-700">
          {t('requestNewSuccess')}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          data-testid="submit-new-community"
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          {submitting ? t('requesting') : t('requestNewSubmit')}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-stone-600 hover:text-stone-900"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  )
}
