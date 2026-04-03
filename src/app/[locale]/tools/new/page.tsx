import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getUser } from '@/lib/supabase/server'
import { getUserCommunities } from '@/lib/queries/communities'
import { ToolForm } from '@/components/tools/ToolForm'
import { trackPageView } from '@/lib/tracking'

interface NewToolPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewToolPage({ params }: NewToolPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('tools')

  const user = await getUser()

  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/tools/new`)
  }

  trackPageView('/tools/new', 'tool_create_page', user.id)

  const communities = await getUserCommunities(user.id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 data-testid="new-tool-heading" className="mb-8 text-2xl font-bold text-gray-900">
        {t('addTool')}
      </h1>
      <ToolForm mode="create" locale={locale} communities={communities} />
    </div>
  )
}
