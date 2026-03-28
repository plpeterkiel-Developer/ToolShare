'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { resolveReport } from '@/lib/actions/admin'

interface ResolveReportButtonProps {
  reportId: string
}

export function ResolveReportButton({ reportId }: ResolveReportButtonProps) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('admin.reports')

  async function handleClick() {
    setLoading(true)
    await resolveReport(reportId)
    setLoading(false)
  }

  return (
    <Button variant="primary" size="sm" loading={loading} onClick={handleClick}>
      {t('resolve')}
    </Button>
  )
}
