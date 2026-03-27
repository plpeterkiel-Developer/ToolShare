import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getProfile } from '@/lib/queries/profile'
import { getToolsByOwner } from '@/lib/queries/tools'
import { getRatingsForUser, getAverageRating } from '@/lib/queries/ratings'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { RatingsList } from '@/components/ratings/RatingsList'
import { RatingStars } from '@/components/ratings/RatingStars'
import { Avatar } from '@/components/ui/Avatar'

interface PublicProfilePageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const [profile, tools, ratings, averageRating] = await Promise.all([
    getProfile(id),
    getToolsByOwner(id),
    getRatingsForUser(id),
    getAverageRating(id),
  ])

  if (!profile) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-12">
      {/* Profile header */}
      <section data-testid="public-profile-header" className="flex items-start gap-6">
        <Avatar name={profile.display_name} avatarUrl={profile.avatar_url} size="lg" />
        <div className="flex-1 min-w-0">
          <h1 data-testid="profile-display-name" className="text-2xl font-bold text-gray-900">
            {profile.display_name}
          </h1>

          {profile.location && (
            <p className="text-sm text-gray-500 mt-0.5" data-testid="profile-location">
              {profile.location}
            </p>
          )}

          {/* Average rating */}
          {averageRating !== null && (
            <div className="flex items-center gap-2 mt-2" data-testid="profile-average-rating">
              <RatingStars score={averageRating} size="sm" />
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({ratings.length} rating{ratings.length !== 1 ? 's' : ''}
                )
              </span>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">
            Member since{' '}
            {new Date(profile.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
            })}
          </p>

          {/* Bio */}
          {profile.bio && (
            <p
              data-testid="profile-bio"
              className="mt-3 text-sm text-gray-700 leading-relaxed max-w-prose"
            >
              {profile.bio}
            </p>
          )}
        </div>
      </section>

      {/* Tools */}
      <section data-testid="profile-tools-section">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Tools ({tools.length})</h2>
        <ToolGrid
          tools={tools}
          locale={locale}
          emptyTitle="No tools listed"
          emptyDescription="This user hasn't added any tools yet"
        />
      </section>

      {/* Ratings */}
      <section data-testid="profile-ratings-section">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Ratings ({ratings.length})</h2>
        <RatingsList ratings={ratings} emptyTitle="No ratings yet" />
      </section>
    </div>
  )
}
