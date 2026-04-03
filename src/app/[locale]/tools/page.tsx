import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getTools } from '@/lib/queries/tools'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { SearchBar } from '@/components/tools/SearchBar'
import { CategoryFilter } from '@/components/tools/CategoryFilter'
import { LocationFilter } from '@/components/tools/LocationFilter'
import { TOOL_CATEGORIES } from '@/lib/utils/constants'
import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import { trackPageView } from '@/lib/tracking'

interface ToolsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    q?: string
    category?: string
    lat?: string
    lng?: string
    radius?: string
  }>
}

export default async function ToolsPage({ params, searchParams }: ToolsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const { q, category, lat: latStr, lng: lngStr, radius: radiusStr } = await searchParams

  const t = await getTranslations('tools')

  const user = await getUser()

  trackPageView('/tools', 'tools_browse', user?.id)

  // Get the user's preferred search radius from their profile (default 2 km)
  let userRadius = 2
  if (user) {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('search_radius')
      .eq('id', user.id)
      .single()
    if (profile) userRadius = (profile as { search_radius: number }).search_radius
  }

  // Parse location filter params
  const lat = latStr ? parseFloat(latStr) : undefined
  const lng = lngStr ? parseFloat(lngStr) : undefined
  const radiusKm = radiusStr ? parseFloat(radiusStr) : userRadius
  const hasLocation = lat != null && !isNaN(lat) && lng != null && !isNaN(lng)

  const tools = await getTools({
    search: q,
    category,
    lat: hasLocation ? lat : undefined,
    lng: hasLocation ? lng : undefined,
    radiusKm: hasLocation ? radiusKm : undefined,
    userId: user?.id,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 data-testid="tools-heading" className="text-2xl font-bold text-stone-900">
          {t('browse')}
        </h1>
        {user && (
          <Link
            href={`/${locale}/tools/new`}
            data-testid="add-tool-link"
            className="inline-flex items-center justify-center rounded-xl bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-2 transition-colors"
          >
            + {t('addTool')}
          </Link>
        )}
      </div>

      {/* Search + filter row */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-start">
        <div className="flex-1">
          <SearchBar defaultValue={q} placeholder={t('search')} />
        </div>
        <CategoryFilter categories={[...TOOL_CATEGORIES]} selectedCategory={category} />
      </div>

      {/* Location filter */}
      <div className="mb-8">
        <LocationFilter
          defaultLat={hasLocation ? lat : undefined}
          defaultLng={hasLocation ? lng : undefined}
          userRadius={userRadius}
        />
      </div>

      {/* Active filters summary */}
      {(q || category || hasLocation) && (
        <p className="mb-4 text-sm text-stone-500" data-testid="active-filters">
          {t('resultsCount', { count: tools.length })}
          {q ? ` ${t('resultsFor', { query: q })}` : ''}
          {category ? ` ${t('resultsIn', { category })}` : ''}
          {hasLocation ? ` ${t('location.withinRadius', { radius: radiusKm })}` : ''}
        </p>
      )}

      {/* Results */}
      <ToolGrid
        tools={tools}
        locale={locale}
        emptyTitle={t('noTools')}
        emptyDescription={t('noToolsHint')}
      />
    </div>
  )
}
