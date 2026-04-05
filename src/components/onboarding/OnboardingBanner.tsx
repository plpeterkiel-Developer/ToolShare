import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface OnboardingBannerProps {
  locale: string
  hasPendingRequest: boolean
}

export async function OnboardingBanner({ locale, hasPendingRequest }: OnboardingBannerProps) {
  const t = await getTranslations('onboarding')

  return (
    <div
      role="status"
      data-testid="onboarding-banner"
      className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <p className="text-sm text-amber-900">
          {hasPendingRequest ? t('bannerPending') : t('bannerNoCommunity')}
        </p>
        <Link
          href={`/${locale}/onboarding`}
          data-testid="onboarding-banner-cta"
          className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          {hasPendingRequest ? t('bannerPendingCta') : t('bannerCta')}
        </Link>
      </div>
    </div>
  )
}
