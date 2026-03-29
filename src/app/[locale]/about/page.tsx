import { getTranslations, setRequestLocale } from 'next-intl/server'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('about')

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 text-lg text-green-100 sm:text-xl">{t('heroSubtitle')}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col gap-16">
        {/* The Problem */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-stone-900">{t('problemTitle')}</h2>
          <p className="text-base text-stone-600 leading-relaxed">{t('problemText1')}</p>
          <p className="text-base text-stone-600 leading-relaxed">{t('problemText2')}</p>
        </section>

        {/* Our Solution */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-stone-900">{t('solutionTitle')}</h2>
          <p className="text-base text-stone-600 leading-relaxed">{t('solutionText')}</p>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-green-100 bg-green-50 p-6 flex flex-col gap-2">
              <h3 className="text-base font-semibold text-green-900">{t('benefit1Title')}</h3>
              <p className="text-sm text-green-800">{t('benefit1Text')}</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 p-6 flex flex-col gap-2">
              <h3 className="text-base font-semibold text-green-900">{t('benefit2Title')}</h3>
              <p className="text-sm text-green-800">{t('benefit2Text')}</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 p-6 flex flex-col gap-2">
              <h3 className="text-base font-semibold text-green-900">{t('benefit3Title')}</h3>
              <p className="text-sm text-green-800">{t('benefit3Text')}</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-stone-900">{t('howTitle')}</h2>
          <ol className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            <li className="flex-1 flex flex-col gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-800 text-sm font-bold text-white">
                1
              </span>
              <h3 className="text-base font-semibold text-stone-900">{t('step1Title')}</h3>
              <p className="text-sm text-stone-600">{t('step1Text')}</p>
            </li>
            <li className="flex-1 flex flex-col gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-800 text-sm font-bold text-white">
                2
              </span>
              <h3 className="text-base font-semibold text-stone-900">{t('step2Title')}</h3>
              <p className="text-sm text-stone-600">{t('step2Text')}</p>
            </li>
            <li className="flex-1 flex flex-col gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-800 text-sm font-bold text-white">
                3
              </span>
              <h3 className="text-base font-semibold text-stone-900">{t('step3Title')}</h3>
              <p className="text-sm text-stone-600">{t('step3Text')}</p>
            </li>
          </ol>
        </section>

        {/* Closing */}
        <section className="rounded-xl border border-amber-100 bg-amber-50 p-8 text-center">
          <p className="text-base font-medium text-amber-900">{t('closingText')}</p>
        </section>
      </div>
    </div>
  )
}
