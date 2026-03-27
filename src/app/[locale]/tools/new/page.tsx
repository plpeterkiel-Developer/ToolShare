import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ToolForm } from '@/components/tools/ToolForm'

interface NewToolPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewToolPage({ params }: NewToolPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/tools/new`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 data-testid="new-tool-heading" className="mb-8 text-2xl font-bold text-gray-900">
        Add a Tool
      </h1>
      <ToolForm mode="create" locale={locale} />
    </div>
  )
}
