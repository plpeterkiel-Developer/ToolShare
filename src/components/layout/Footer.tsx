import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export interface FooterProps {
  locale: string
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations('footer')

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8">
        <p>{t('copyright')}</p>
        <nav aria-label="Footer navigation">
          <Link
            href={`/${locale}/gdpr`}
            className="hover:text-gray-900 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded"
          >
            {t('gdprLink')}
          </Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
