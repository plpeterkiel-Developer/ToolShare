'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ToolImageUpload } from '@/components/tools/ToolImageUpload'
import { createTool, updateTool } from '@/lib/actions/tools'
import type { Tool } from '@/types/database.types'

export interface ToolFormProps {
  initialData?: Partial<Tool>
  locale: string
  mode: 'create' | 'edit'
  toolId?: string
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

const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }))

const conditionOptions = [
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'worn', label: 'Worn' },
]

const availabilityOptions = [
  { value: 'available', label: 'Available' },
  { value: 'on_loan', label: 'On loan' },
  { value: 'unavailable', label: 'Unavailable' },
]

export function ToolForm({ initialData, mode, toolId }: ToolFormProps) {
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    if (imageUrl) {
      formData.set('image_url', imageUrl)
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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {error && (
        <div
          role="alert"
          data-testid="tool-form-error"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <Input
        id="tool-name"
        name="name"
        type="text"
        label="Tool name"
        required
        defaultValue={initialData?.name ?? ''}
        data-testid="tool-name"
      />

      <Textarea
        id="tool-description"
        name="description"
        label="Description"
        defaultValue={initialData?.description ?? ''}
        data-testid="tool-description"
      />

      <Select
        id="tool-category"
        name="category"
        label="Category"
        required
        options={categoryOptions}
        defaultValue={initialData?.category ?? categoryOptions[0].value}
        data-testid="tool-category"
      />

      <Select
        id="tool-condition"
        name="condition"
        label="Condition"
        required
        options={conditionOptions}
        defaultValue={initialData?.condition ?? 'good'}
        data-testid="tool-condition"
      />

      {mode === 'edit' && (
        <Select
          id="availability"
          name="availability"
          label="Availability"
          options={availabilityOptions}
          defaultValue={initialData?.availability ?? 'available'}
          data-testid="availability-toggle"
        />
      )}

      <ToolImageUpload currentUrl={initialData?.image_url} onUpload={(url) => setImageUrl(url)} />

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        data-testid="tool-form-submit"
        className="w-full sm:w-auto"
      >
        {mode === 'edit' ? 'Save changes' : 'Create tool'}
      </Button>
    </form>
  )
}
