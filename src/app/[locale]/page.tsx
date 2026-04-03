import { Suspense } from 'react'
import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getRecentAvailableTools } from '@/lib/queries/tools'
import { getUser } from '@/lib/supabase/server'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { HomeSearchBar } from '@/components/home/HomeSearchBar'
import { BookingsButton } from '@/components/home/BookingsButton'
import { trackPageView } from '@/lib/tracking'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')

  const user = await getUser()

  trackPageView('/', 'home', user?.id)

  const recentTools = await getRecentAvailableTools(6)

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section
        data-testid="hero-section"
        className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-24 px-4 sm:py-32 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1
            data-testid="hero-title"
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t('hero.title')}
          </h1>
          <p data-testid="hero-subtitle" className="mt-6 text-lg text-green-100 sm:text-xl">
            {t('hero.subtitle')}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/tools`}
              data-testid="cta-browse"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900 transition-all duration-200"
            >
              {t('hero.cta')}
            </Link>
            <Link
              href={`/${locale}/tools/new`}
              data-testid="cta-add-tool"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur px-8 py-3.5 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900 transition-all duration-200"
            >
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Search + bookings bar */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <HomeSearchBar locale={locale} />
          </div>
          {user && (
            <Suspense>
              <BookingsButton userId={user.id} locale={locale} />
            </Suspense>
          )}
        </div>
      </section>

      {/* Recent tools section */}
      <section
        data-testid="recent-tools-section"
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <h2 className="mb-8 text-2xl font-bold text-stone-900">{t('recentTools')}</h2>
        <ToolGrid
          tools={recentTools}
          locale={locale}
          emptyTitle={t('noToolsYet')}
          emptyDescription={t('noToolsYetHint')}
        />
        {recentTools.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href={`/${locale}/tools`}
              className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-6 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 transition-all duration-200"
            >
              {t('viewAll')} →
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
