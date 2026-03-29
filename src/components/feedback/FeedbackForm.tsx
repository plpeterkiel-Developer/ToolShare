'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { submitFeedback } from '@/lib/actions/feedback'

export function FeedbackForm() {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('feedback')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)

    const formData = new FormData(e.currentTarget)
    const message = (formData.get('message') as string)?.trim()

    if (!message) {
      setError(t('messageRequired'))
      return
    }

    setLoading(true)
    const result = await submitFeedback(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div
        role="status"
        data-testid="feedback-success"
        className="rounded-2xl bg-green-50 px-6 py-4 text-sm text-green-700"
      >
        {t('success')}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      data-testid="feedback-form"
      className="flex flex-col gap-5"
    >
      <Select
        id="feedback-type"
        name="type"
        label={t('typeLabel')}
        options={[
          { value: 'feedback', label: t('typeFeedback') },
          { value: 'bug', label: t('typeBug') },
          { value: 'suggestion', label: t('typeSuggestion') },
        ]}
      />

      <Textarea
        id="feedback-message"
        name="message"
        label={t('messageLabel')}
        rows={5}
        placeholder={t('messagePlaceholder')}
        required
        data-testid="feedback-message"
      />

      {error && (
        <p role="alert" data-testid="feedback-error" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        data-testid="feedback-submit"
        className="w-full sm:w-auto"
      >
        {t('submit')}
      </Button>
    </form>
  )
}
