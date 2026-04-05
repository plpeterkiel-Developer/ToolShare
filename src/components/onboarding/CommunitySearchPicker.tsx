'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { searchCommunitiesAction, requestJoinCommunity } from '@/lib/actions/communities'
import type { Community } from '@/types/database.types'

interface CommunitySearchPickerProps {
  /** Community IDs the user already has a pending request for. */
  pendingCommunityIds: string[]
  /** Community IDs the user is already a member of. */
  memberCommunityIds: string[]
}

export function CommunitySearchPicker({
  pendingCommunityIds,
  memberCommunityIds,
}: CommunitySearchPickerProps) {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Community[]>([])
  const [loading, setLoading] = useState(false)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const res = await searchCommunitiesAction(query)
      setLoading(false)
      if ('results' in res && res.results) setResults(res.results)
      else setResults([])
    }, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleRequest = async (communityId: string) => {
    setError(null)
    setSubmittingId(communityId)
    const res = await requestJoinCommunity(communityId)
    setSubmittingId(null)
    if ('error' in res && res.error) {
      setError(res.error)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-stone-700">{t('searchLabel')}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2.5 text-base focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          data-testid="community-search-input"
          autoFocus
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <ul
        data-testid="community-search-results"
        className="divide-y divide-stone-200 rounded-lg border border-stone-200"
      >
        {loading && results.length === 0 ? (
          <li className="px-4 py-3 text-sm text-stone-500">{t('searching')}</li>
        ) : results.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-stone-500">{t('noResults')}</li>
        ) : (
          results.map((c) => {
            const isMember = memberCommunityIds.includes(c.id)
            const isPending = pendingCommunityIds.includes(c.id)
            const isSubmitting = submittingId === c.id
            return (
              <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-900">{c.name}</p>
                  {c.description && (
                    <p className="truncate text-sm text-stone-500">{c.description}</p>
                  )}
                </div>
                {isMember ? (
                  <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    {t('statusMember')}
                  </span>
                ) : isPending ? (
                  <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    {t('statusPending')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequest(c.id)}
                    disabled={isSubmitting}
                    data-testid={`join-community-${c.id}`}
                    className="shrink-0 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    {isSubmitting ? t('requesting') : t('requestJoin')}
                  </button>
                )}
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
