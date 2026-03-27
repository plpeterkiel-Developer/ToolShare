'use client'

import React, { useState } from 'react'
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

  const tabs = [
    { id: 'incoming' as const, label: 'Incoming', count: incoming.length },
    { id: 'outgoing' as const, label: 'Outgoing', count: outgoing.length },
  ]

  const items = activeTab === 'incoming' ? incoming : outgoing

  return (
    <div>
      {/* Tab bar */}
      <div role="tablist" aria-label="Request tabs" className="flex border-b border-gray-200 mb-6">
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
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
              activeTab === tab.id
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ].join(' ')}
          >
            {tab.label}
            <span
              className={[
                'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium min-w-[1.25rem]',
                activeTab === tab.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
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
            title={activeTab === 'incoming' ? 'No incoming requests' : 'No outgoing requests'}
            description={
              activeTab === 'incoming'
                ? 'When someone requests to borrow your tools, they will appear here'
                : 'Your borrow requests will appear here'
            }
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
