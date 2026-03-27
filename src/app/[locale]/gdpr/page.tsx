import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { GdprPanel } from '@/components/gdpr/GdprPanel'

interface GdprPageProps {
  params: Promise<{ locale: string }>
}

export default async function GdprPage({ params }: GdprPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

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
          Your Data &amp; Privacy Rights
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Under the General Data Protection Regulation (GDPR), you have several rights regarding
          your personal data. Use the tools below to exercise these rights.
        </p>
      </div>

      {/* GDPR rights explanation */}
      <section className="rounded-xl border border-blue-100 bg-blue-50 p-6 flex flex-col gap-3">
        <h2 className="text-base font-semibold text-blue-900">Your rights under GDPR</h2>
        <ul className="list-disc list-inside flex flex-col gap-1.5 text-sm text-blue-800">
          <li>
            <strong>Right of access</strong> — You can request a copy of all personal data we hold
            about you.
          </li>
          <li>
            <strong>Right to rectification</strong> — You can correct inaccurate or incomplete
            personal data.
          </li>
          <li>
            <strong>Right to erasure</strong> — You can request deletion of your personal data
            (&ldquo;the right to be forgotten&rdquo;).
          </li>
          <li>
            <strong>Right to data portability</strong> — You can receive your data in a
            machine-readable format.
          </li>
          <li>
            <strong>Right to object</strong> — You can object to processing of your personal data in
            certain circumstances.
          </li>
        </ul>
        <p className="text-xs text-blue-700 mt-1">
          For requests not covered by the tools below, contact us at{' '}
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
