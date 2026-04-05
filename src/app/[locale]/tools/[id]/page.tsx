import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getToolById } from '@/lib/queries/tools'
import { getPendingRequestsForTool } from '@/lib/queries/requests'
import { getUserCommunityIds } from '@/lib/queries/communities'
import { getUser } from '@/lib/supabase/server'
import { BorrowRequestButton } from '@/components/requests/BorrowRequestButton'
import { DeleteToolButton } from '@/components/tools/DeleteToolButton'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import type { ToolAvailability, ToolCondition } from '@/types/database.types'
import { trackPageView } from '@/lib/tracking'

interface ToolDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const t = await getTranslations('tools')

  const tool = await getToolById(id)
  if (!tool) notFound()

  const user = await getUser()

  trackPageView('/tools/[id]', 'tool_detail', user?.id)

  const isOwner = user?.id === tool.owner_id

  // Check if user is a member of the tool's community (for borrow restriction)
  let isCommunityMember = true
  if (tool.community_id && user && !isOwner) {
    const userCommunityIds = await getUserCommunityIds(user.id)
    isCommunityMember = userCommunityIds.includes(tool.community_id)
  }

  const availabilityConfig: Record<
    ToolAvailability,
    { variant: 'green' | 'yellow' | 'gray'; key: string }
  > = {
    available: { variant: 'green', key: 'available' },
    on_loan: { variant: 'yellow', key: 'onLoan' },
    unavailable: { variant: 'gray', key: 'unavailable' },
  }

  const conditionKeys: Record<ToolCondition, string> = {
    good: 'condition.good',
    fair: 'condition.fair',
    worn: 'condition.worn',
  }

  const badge = availabilityConfig[tool.availability] ?? {
    variant: 'gray' as const,
    key: 'unavailable',
  }

  // Count active requests for the owner view
  let activeRequestCount = 0
  if (isOwner) {
    const activeRequests = await getPendingRequestsForTool(tool.id)
    activeRequestCount = activeRequests?.length ?? 0
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-100">
          {tool.image_url ? (
            <Image
              src={tool.image_url}
              alt={tool.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 data-testid="tool-detail-name" className="text-2xl font-bold text-stone-900">
                {tool.name}
              </h1>
              <Badge variant={badge.variant}>{t(badge.key)}</Badge>
            </div>
            <p data-testid="tool-detail-category" className="mt-1 text-sm text-stone-500">
              {tool.category}
            </p>
          </div>

          <div className="flex gap-4 text-sm text-stone-600">
            <span data-testid="tool-detail-condition">
              <span className="font-medium">{t('conditionLabel')}</span>{' '}
              {t(conditionKeys[tool.condition] ?? 'condition.good')}
            </span>
          </div>

          {/* Community badge */}
          {tool.community && (
            <div className="flex items-center gap-2" data-testid="tool-community-badge">
              <Badge variant="blue">{tool.community.name}</Badge>
              <span className="text-xs text-stone-500">{t('detail.communityOnly')}</span>
            </div>
          )}

          {tool.description && (
            <p
              data-testid="tool-detail-description"
              className="text-sm text-stone-600 leading-relaxed"
            >
              {tool.description}
            </p>
          )}

          {/* Owner info */}
          {tool.owner && (
            <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
              <Avatar name={tool.owner.display_name} avatarUrl={tool.owner.avatar_url} size="md" />
              <div className="min-w-0">
                <p className="text-xs text-stone-500">{t('detail.ownedBy')}</p>
                <Link
                  href={`/${locale}/profile/${tool.owner.id}`}
                  data-testid="tool-owner-link"
                  className="text-sm font-medium text-stone-900 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-800 rounded"
                >
                  {tool.owner.display_name}
                </Link>
                {tool.owner.location && (
                  <p className="text-xs text-stone-400">{tool.owner.location}</p>
                )}
              </div>
            </div>
          )}

          {/* Borrow action - restricted if not community member */}
          {tool.community_id && !isCommunityMember && !isOwner ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              {t('detail.communityRestricted')}
            </p>
          ) : (
            <BorrowRequestButton tool={tool} currentUserId={user?.id ?? null} />
          )}

          {/* Owner controls */}
          {isOwner && (
            <div
              data-testid="owner-controls"
              className="flex flex-wrap gap-2 pt-2 border-t border-stone-100"
            >
              {activeRequestCount > 0 && (
                <p className="w-full text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  {t('activeRequests', { count: activeRequestCount })}
                </p>
              )}
              <Link
                href={`/${locale}/tools/${tool.id}/edit`}
                data-testid="edit-tool-link"
                className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-2 transition-colors"
              >
                {t('detail.editListing')}
              </Link>
              <DeleteToolButton toolId={tool.id} locale={locale} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
