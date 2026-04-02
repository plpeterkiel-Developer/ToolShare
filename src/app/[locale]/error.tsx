'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errors')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-stone-300">500</h1>
      <h2 className="mt-4 text-xl font-semibold text-stone-900">{t('errorTitle')}</h2>
      <p className="mt-2 text-sm text-stone-500 max-w-md">{t('errorDescription')}</p>
      <Button type="button" variant="primary" onClick={reset} className="mt-8">
        {t('errorAction')}
      </Button>
    </div>
  )
}
