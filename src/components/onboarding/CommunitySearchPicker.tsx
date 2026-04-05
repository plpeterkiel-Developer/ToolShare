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
  /** Optional element rendered between the search input and the results list. */
  belowSearchBar?: React.ReactNode
}

export function CommunitySearchPicker({
  pendingCommunityIds,
  memberCommunityIds,
  belowSearchBar,
}: CommunitySearchPickerProps) {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Community[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pickupAddress, setPickupAddress] = useState('')
  const [message, setMessage] = useState('')
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

  const handleExpand = (communityId: string) => {
    setExpandedId(communityId)
    setPickupAddress('')
    setMessage('')
    setError(null)
  }

  const handleSendRequest = async (communityId: string) => {
    setError(null)
    setSubmittingId(communityId)
    const res = await requestJoinCommunity(communityId, message || null, pickupAddress || null)
    setSubmittingId(null)
    if ('error' in res && res.error) {
      setError(res.error)
      return
    }
    setExpandedId(null)
    setPickupAddress('')
    setMessage('')
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

      {belowSearchBar && <div>{belowSearchBar}</div>}

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
            const isExpanded = expandedId === c.id
            const isSubmitting = submittingId === c.id
            return (
              <li key={c.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-4">
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
                      onClick={() => (isExpanded ? setExpandedId(null) : handleExpand(c.id))}
                      data-testid={`join-community-${c.id}`}
                      className="shrink-0 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
                    >
                      {t('requestJoin')}
                    </button>
                  )}
                </div>
                {isExpanded && !isMember && !isPending && (
                  <div className="mt-3 space-y-3 rounded-lg bg-stone-50 p-3">
                    <label className="block">
                      <span className="text-sm font-medium text-stone-700">
                        {t('pickupAddressLabel')}
                      </span>
                      <input
                        type="text"
                        maxLength={255}
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder={t('requestNewAddressPlaceholder')}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                        data-testid={`join-pickup-${c.id}`}
                      />
                      <span className="mt-1 block text-xs text-stone-500">
                        {t('pickupAddressHelp')}
                      </span>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-stone-700">
                        {t('joinRequestMessageLabel')}
                      </span>
                      <textarea
                        rows={2}
                        maxLength={500}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                        data-testid={`join-message-${c.id}`}
                      />
                    </label>
                    {error && (
                      <p role="alert" className="text-sm text-red-600">
                        {error}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendRequest(c.id)}
                        disabled={isSubmitting}
                        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
                        data-testid={`send-join-${c.id}`}
                      >
                        {isSubmitting ? t('requesting') : t('sendJoinRequest')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedId(null)}
                        className="text-sm text-stone-600 hover:text-stone-900"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
