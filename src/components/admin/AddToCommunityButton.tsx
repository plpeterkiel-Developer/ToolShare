'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { addCommunityMember } from '@/lib/actions/admin'

interface AddToCommunityButtonProps {
  userId: string
  communities: { id: string; name: string }[]
}

export function AddToCommunityButton({ userId, communities }: AddToCommunityButtonProps) {
  const t = useTranslations('admin.users')
  const [open, setOpen] = useState(false)
  const [selectedCommunityId, setSelectedCommunityId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (communities.length === 0) return null

  async function handleAdd() {
    if (!selectedCommunityId) return
    setLoading(true)
    setError(null)

    const result = await addCommunityMember(selectedCommunityId, userId)
    if (result && 'error' in result) {
      setError(result.error === 'User is already a member' ? t('alreadyMember') : result.error)
    } else {
      setOpen(false)
      setSelectedCommunityId('')
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
      >
        {t('addToCommunity')}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedCommunityId}
        onChange={(e) => {
          setSelectedCommunityId(e.target.value)
          setError(null)
        }}
        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        disabled={loading}
      >
        <option value="">{t('selectCommunity')}</option>
        {communities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!selectedCommunityId || loading}
        className="rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {loading ? '...' : '✓'}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false)
          setSelectedCommunityId('')
          setError(null)
        }}
        className="rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
      >
        ✕
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
