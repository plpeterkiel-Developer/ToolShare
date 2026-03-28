'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ToolImageUpload } from '@/components/tools/ToolImageUpload'
import { createTool, updateTool } from '@/lib/actions/tools'
import type { Tool, Community } from '@/types/database.types'

export interface ToolFormProps {
  initialData?: Partial<Tool>
  locale: string
  mode: 'create' | 'edit'
  toolId?: string
  communities?: Community[]
}

const CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Garden Tools',
  'Measuring Tools',
  'Automotive',
  'Plumbing',
  'Electrical',
  'Woodworking',
  'Other',
]

export function ToolForm({ initialData, mode, toolId, communities = [] }: ToolFormProps) {
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url ?? '')
  const t = useTranslations('tools')

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }))

  const conditionOptions = [
    { value: 'good', label: t('condition.good') },
    { value: 'fair', label: t('condition.fair') },
    { value: 'worn', label: t('condition.worn') },
  ]

  const availabilityOptions = [
    { value: 'available', label: t('available') },
    { value: 'on_loan', label: t('onLoan') },
    { value: 'unavailable', label: t('unavailable') },
  ]

  // Community options: "no restriction" + user's communities
  const communityOptions = [
    { value: '', label: t('form.noRestriction') },
    ...communities.map((c) => ({ value: c.id, label: c.name })),
  ]

  // Default community: in edit mode use existing value; in create mode default to first community
  const defaultCommunityId =
    mode === 'edit'
      ? (initialData?.community_id ?? '')
      : communities.length > 0
        ? communities[0].id
        : ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    if (imageUrl) {
      formData.set('image_url', imageUrl)
    }

    // Ensure empty community_id is sent as empty string (server treats as null)
    const communityVal = formData.get('community_id')
    if (!communityVal) {
      formData.delete('community_id')
    }

    let result: { error?: string } | undefined

    if (mode === 'edit' && toolId) {
      result = await updateTool(toolId, formData)
    } else {
      result = await createTool(formData)
    }

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {error && (
          <div
            role="alert"
            data-testid="tool-form-error"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <Input
          id="tool-name"
          name="name"
          type="text"
          label={t('form.name')}
          required
          defaultValue={initialData?.name ?? ''}
          data-testid="tool-name"
        />

        <Textarea
          id="tool-description"
          name="description"
          label={t('form.description')}
          defaultValue={initialData?.description ?? ''}
          data-testid="tool-description"
        />

        <Select
          id="tool-category"
          name="category"
          label={t('form.category')}
          required
          options={categoryOptions}
          defaultValue={initialData?.category ?? categoryOptions[0].value}
          data-testid="tool-category"
        />

        <Select
          id="tool-condition"
          name="condition"
          label={t('form.condition')}
          required
          options={conditionOptions}
          defaultValue={initialData?.condition ?? 'good'}
          data-testid="tool-condition"
        />

        {mode === 'edit' && (
          <Select
            id="availability"
            name="availability"
            label={t('form.availability')}
            options={availabilityOptions}
            defaultValue={initialData?.availability ?? 'available'}
            data-testid="availability-toggle"
          />
        )}

        {communities.length > 0 && (
          <div>
            <Select
              id="tool-community"
              name="community_id"
              label={t('form.community')}
              options={communityOptions}
              defaultValue={defaultCommunityId}
              data-testid="tool-community"
            />
            <p className="mt-1 text-xs text-stone-500">{t('form.communityHint')}</p>
          </div>
        )}

        <ToolImageUpload currentUrl={initialData?.image_url} onUpload={(url) => setImageUrl(url)} />

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          data-testid="tool-form-submit"
          className="w-full sm:w-auto"
        >
          {mode === 'edit' ? t('form.submitEdit') : t('form.submitCreate')}
        </Button>
      </form>
    </div>
  )
}
