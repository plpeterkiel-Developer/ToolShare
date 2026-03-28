import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { GdprPanel } from '@/components/gdpr/GdprPanel'

interface GdprPageProps {
  params: Promise<{ locale: string }>
}

export default async function GdprPage({ params }: GdprPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('gdpr')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/gdpr`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 data-testid="gdpr-heading" className="text-2xl font-bold text-gray-900">
          {t('pageTitle')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">{t('pageDescription')}</p>
      </div>

      {/* GDPR rights explanation */}
      <section className="rounded-xl border border-blue-100 bg-blue-50 p-6 flex flex-col gap-3">
        <h2 className="text-base font-semibold text-blue-900">{t('rightsTitle')}</h2>
        <ul className="list-disc list-inside flex flex-col gap-1.5 text-sm text-blue-800">
          <li>{t.rich('rightAccess', { bold: (chunks) => <strong>{chunks}</strong> })}</li>
          <li>{t.rich('rightRectification', { bold: (chunks) => <strong>{chunks}</strong> })}</li>
          <li>{t.rich('rightErasure', { bold: (chunks) => <strong>{chunks}</strong> })}</li>
          <li>{t.rich('rightPortability', { bold: (chunks) => <strong>{chunks}</strong> })}</li>
          <li>{t.rich('rightObject', { bold: (chunks) => <strong>{chunks}</strong> })}</li>
        </ul>
        <p className="text-xs text-blue-700 mt-1">
          {t('contactInfo')}{' '}
          <a
            href="mailto:privacy@toolshare.app"
            className="underline hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            privacy@toolshare.app
          </a>
          .
        </p>
      </section>

      {/* GDPR actions */}
      <GdprPanel />
    </div>
  )
}
