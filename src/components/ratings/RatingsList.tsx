import { RatingStars } from '@/components/ratings/RatingStars'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'

interface RatingWithRater {
  id: string
  score: number
  comment: string | null
  created_at: string
  rater: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
}

export interface RatingsListProps {
  ratings: RatingWithRater[]
  emptyTitle?: string
}

export function RatingsList({ ratings, emptyTitle = 'No ratings yet' }: RatingsListProps) {
  if (ratings.length === 0) {
    return <EmptyState title={emptyTitle} />
  }

  return (
    <ul data-testid="ratings-list" className="flex flex-col gap-4">
      {ratings.map((rating) => (
        <li
          key={rating.id}
          data-testid="rating-item"
          className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-3">
            <Avatar
              name={rating.rater?.display_name ?? 'User'}
              avatarUrl={rating.rater?.avatar_url}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {rating.rater?.display_name ?? 'Anonymous'}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(rating.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <RatingStars score={rating.score} size="sm" />
          </div>
          {rating.comment && (
            <p className="text-sm text-gray-600 italic">&ldquo;{rating.comment}&rdquo;</p>
          )}
        </li>
      ))}
    </ul>
  )
}
