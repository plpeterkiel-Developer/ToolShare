import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'

interface ConfirmPageProps {
  params: Promise<{ locale: string }>
}

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-sm text-center">
        <div className="mb-6 text-5xl">✉️</div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          {locale === 'da' ? 'Bekræft din e-mail' : 'Check your email'}
        </h1>
        <p className="mb-8 text-gray-600">
          {locale === 'da'
            ? 'Vi har sendt dig et bekræftelseslink. Klik på linket i e-mailen for at aktivere din konto.'
            : "We've sent you a confirmation link. Click the link in the email to activate your account."}
        </p>
        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
        >
          {locale === 'da' ? 'Gå til log ind' : 'Go to login'}
        </Link>
      </div>
    </div>
  )
}
