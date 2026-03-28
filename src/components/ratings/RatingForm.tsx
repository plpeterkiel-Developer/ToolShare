'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { submitRating } from '@/lib/actions/ratings'

export interface RatingFormProps {
  requestId: string
  rateeId: string
  rateeName: string
}

export function RatingForm({ requestId, rateeId, rateeName }: RatingFormProps) {
  const [score, setScore] = useState<number>(0)
  const [hovered, setHovered] = useState<number>(0)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('ratings')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)

    if (score === 0) {
      setError(t('selectRating'))
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('request_id', requestId)
    formData.set('ratee_id', rateeId)
    formData.set('score', String(score))

    const result = await submitRating(formData)
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
        data-testid="rating-success"
        className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700"
      >
        {t('thankYou', { name: rateeName })}
      </div>
    )
  }

  const displayScore = hovered || score

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      data-testid="rating-form"
      className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4"
    >
      <p className="text-sm font-medium text-stone-700">
        {t('rateExperience')} <strong>{rateeName}</strong>
      </p>

      {/* Star selector */}
      <div
        role="radiogroup"
        aria-label="Star rating"
        data-testid="rating-stars-selector"
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={score === star}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            data-testid={`star-${star}`}
            onClick={() => setScore(star)}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-2"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              className={[
                'h-8 w-8 transition-colors',
                displayScore >= star ? 'text-amber-500' : 'text-stone-300 hover:text-amber-300',
              ].join(' ')}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {score > 0 && (
          <span className="ml-2 text-sm text-stone-600" aria-live="polite">
            {score} / 5
          </span>
        )}
      </div>

      <Textarea
        id="rating-comment"
        name="comment"
        label={t('comment')}
        rows={3}
        placeholder={t('commentPlaceholder')}
        data-testid="rating-comment"
      />

      {error && (
        <p role="alert" data-testid="rating-error" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        data-testid="rating-submit"
        className="w-full sm:w-auto"
      >
        {t('submit')}
      </Button>
    </form>
  )
}
