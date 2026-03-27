import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getRecentAvailableTools } from '@/lib/queries/tools'
import { ToolGrid } from '@/components/tools/ToolGrid'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')

  const recentTools = await getRecentAvailableTools(6)

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section
        data-testid="hero-section"
        className="bg-gradient-to-br from-green-50 to-white py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1
            data-testid="hero-title"
            className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
          >
            {t('hero.title')}
          </h1>
          <p data-testid="hero-subtitle" className="mt-6 text-lg text-gray-600 sm:text-xl">
            {t('hero.subtitle')}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/tools`}
              data-testid="cta-browse"
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-8 py-3 text-base font-semibold text-white shadow hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
            >
              {t('hero.cta')}
            </Link>
            <Link
              href={`/${locale}/tools/new`}
              data-testid="cta-add-tool"
              className="inline-flex items-center justify-center rounded-md border border-green-600 bg-white px-8 py-3 text-base font-semibold text-green-700 shadow hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
            >
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Recent tools section */}
      <section
        data-testid="recent-tools-section"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <h2 className="mb-8 text-2xl font-bold text-gray-900">{t('recentTools')}</h2>
        <ToolGrid
          tools={recentTools}
          locale={locale}
          emptyTitle="No tools available yet"
          emptyDescription="Be the first to add a tool to the community"
        />
        {recentTools.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href={`/${locale}/tools`}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
            >
              View all tools →
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
