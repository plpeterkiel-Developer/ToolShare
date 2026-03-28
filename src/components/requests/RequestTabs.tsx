'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { RequestCard } from '@/components/requests/RequestCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { RequestWithDetails } from '@/types/database.types'

export interface RequestTabsProps {
  incoming: RequestWithDetails[]
  outgoing: RequestWithDetails[]
  currentUserId: string
  locale: string
}

export function RequestTabs({ incoming, outgoing, currentUserId, locale }: RequestTabsProps) {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming')
  const t = useTranslations('requests')

  const tabs = [
    { id: 'incoming' as const, label: t('incoming'), count: incoming.length },
    { id: 'outgoing' as const, label: t('outgoing'), count: outgoing.length },
  ]

  const items = activeTab === 'incoming' ? incoming : outgoing

  return (
    <div>
      {/* Tab bar */}
      <div role="tablist" aria-label="Request tabs" className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            data-testid={`tab-${tab.id}`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-2',
              activeTab === tab.id
                ? 'bg-green-800 text-white'
                : 'text-stone-600 hover:bg-stone-100',
            ].join(' ')}
          >
            {tab.label}
            <span
              className={[
                'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium min-w-[1.25rem]',
                activeTab === tab.id ? 'bg-green-700 text-white' : 'bg-stone-100 text-stone-500',
              ].join(' ')}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {items.length === 0 ? (
          <EmptyState
            title={activeTab === 'incoming' ? t('noIncoming') : t('noOutgoing')}
            description={activeTab === 'incoming' ? t('noIncomingHint') : t('noOutgoingHint')}
          />
        ) : (
          <div className="flex flex-col gap-4" data-testid={`${activeTab}-requests`}>
            {items.map((request) => (
              <RequestCard key={request.id} request={request} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
