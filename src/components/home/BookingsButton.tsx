import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getRequestCounts } from '@/lib/queries/requestCounts'

interface BookingsButtonProps {
  userId: string
  locale: string
}

export async function BookingsButton({ userId, locale }: BookingsButtonProps) {
  const [t, counts] = await Promise.all([getTranslations('home'), getRequestCounts(userId)])

  const pending = counts.pendingIncoming

  return (
    <Link
      href={`/${locale}/requests`}
      className="relative inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur px-8 py-3.5 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900 transition-all duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      {t('bookings')}
      {pending > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
          {pending}
        </span>
      )}
    </Link>
  )
}
