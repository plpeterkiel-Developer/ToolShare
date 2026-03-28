'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { addCommunityMember } from '@/lib/actions/admin'

interface AddMemberFormProps {
  communityId: string
  availableUsers: { id: string; display_name: string }[]
}

export function AddMemberForm({ communityId, availableUsers }: AddMemberFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [selectedUserId, setSelectedUserId] = useState('')
  const t = useTranslations('admin.communities')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedUserId) return

    setError(undefined)
    setLoading(true)

    const result = await addCommunityMember(communityId, selectedUserId)
    if (result && 'error' in result) {
      setError(result.error)
    } else {
      setSelectedUserId('')
    }
    setLoading(false)
  }

  if (availableUsers.length === 0) {
    return null
  }

  const userOptions = [
    { value: '', label: t('selectUser') },
    ...availableUsers.map((u) => ({ value: u.id, label: u.display_name })),
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {error && (
        <div className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex-1">
        <Select
          id="add-member-select"
          name="profile_id"
          label={t('addMember')}
          options={userOptions}
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          data-testid="add-member-select"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="sm"
        loading={loading}
        disabled={!selectedUserId}
        data-testid="add-member-button"
      >
        {t('addMember')}
      </Button>
    </form>
  )
}
