import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('errors')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-stone-300">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-stone-900">{t('notFoundTitle')}</h2>
      <p className="mt-2 text-sm text-stone-500 max-w-md">{t('notFoundDescription')}</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-green-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-2 transition-colors"
      >
        {t('notFoundAction')}
      </Link>
    </div>
  )
}
