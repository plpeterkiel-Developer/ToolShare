import Link from 'next/link'

export interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8">
        <p>ToolShare &copy; 2026</p>
        <nav aria-label="Footer navigation">
          <Link
            href={`/${locale}/gdpr`}
            className="hover:text-gray-900 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded"
          >
            GDPR &amp; Privacy
          </Link>
        </nav>
      </div>
    </footer>
  )
}
