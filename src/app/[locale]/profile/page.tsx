import { redirect } from 'next/navigation'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/queries/profile'
import { getToolsByOwner } from '@/lib/queries/tools'
import { getRatingsForUser } from '@/lib/queries/ratings'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { RatingsList } from '@/components/ratings/RatingsList'
import { GdprPanel } from '@/components/gdpr/GdprPanel'
import { Avatar } from '@/components/ui/Avatar'

interface ProfilePageProps {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/profile`)
  }

  // Fetch full profile (includes pickup_address for own profile view)
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const [tools, ratings] = await Promise.all([getToolsByOwner(user.id), getRatingsForUser(user.id)])

  if (!profileData) {
    redirect(`/${locale}/auth/login`)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-12">
      {/* Profile header */}
      <section data-testid="profile-header" className="flex items-center gap-5">
        <Avatar name={profileData.display_name} avatarUrl={profileData.avatar_url} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="profile-display-name">
            {profileData.display_name}
          </h1>
          {profileData.location && <p className="text-sm text-gray-500">{profileData.location}</p>}
          <p className="text-xs text-gray-400 mt-1">
            Member since{' '}
            {new Date(profileData.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <Link
          href={`/${locale}/requests`}
          className="ml-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
          data-testid="my-requests-link"
        >
          My Requests
        </Link>
      </section>

      {/* Edit profile */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Edit Profile</h2>
        <ProfileForm profile={profileData} />
      </section>

      {/* My tools */}
      <section data-testid="my-tools-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Tools</h2>
          <Link
            href={`/${locale}/tools/new`}
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
            data-testid="add-tool-link"
          >
            + Add Tool
          </Link>
        </div>
        <ToolGrid
          tools={tools}
          locale={locale}
          emptyTitle="No tools listed yet"
          emptyDescription="Add your first tool to start sharing with the community"
        />
      </section>

      {/* Ratings received */}
      <section data-testid="ratings-section">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Ratings ({ratings.length})</h2>
        <RatingsList ratings={ratings} emptyTitle="No ratings yet" />
      </section>

      {/* GDPR */}
      <section data-testid="gdpr-section">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Privacy &amp; Data</h2>
        <GdprPanel />
      </section>
    </div>
  )
}
