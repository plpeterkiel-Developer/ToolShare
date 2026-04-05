import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getUser } from '@/lib/supabase/server'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { trackPageView } from '@/lib/tracking'

interface FeedbackPageProps {
  params: Promise<{ locale: string }>
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('feedback')

  const user = await getUser()

  trackPageView('/feedback', 'feedback_page', user?.id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{t('pageTitle')}</h1>
        <p className="mt-2 text-sm text-stone-600">{t('pageDescription')}</p>
      </div>

      {user ? (
        <FeedbackForm />
      ) : (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 flex flex-col gap-3 items-start">
          <p className="text-sm text-stone-600">{t('loginRequired')}</p>
          <Link
            href={`/${locale}/auth/login?next=/${locale}/feedback`}
            className="inline-flex items-center justify-center rounded-xl bg-green-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 transition-colors duration-150"
          >
            {t('loginLink')}
          </Link>
        </div>
      )}
    </div>
  )
}
