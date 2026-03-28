'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createCommunity } from '@/lib/actions/admin'

export function CreateCommunityForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const t = useTranslations('admin.communities')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createCommunity(formData)

    if (result && 'error' in result) {
      setError(result.error)
    } else {
      e.currentTarget.reset()
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-end"
    >
      {error && (
        <div className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex-1">
        <Input
          id="community-name"
          name="name"
          type="text"
          label={t('name')}
          required
          data-testid="community-name-input"
        />
      </div>
      <div className="flex-1">
        <Input
          id="community-description"
          name="description"
          type="text"
          label={t('description')}
          data-testid="community-description-input"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="sm"
        loading={loading}
        data-testid="create-community-button"
      >
        {t('create')}
      </Button>
    </form>
  )
}
