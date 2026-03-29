import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getToolById } from '@/lib/queries/tools'
import { getUserCommunities } from '@/lib/queries/communities'
import { createClient } from '@/lib/supabase/server'
import { ToolForm } from '@/components/tools/ToolForm'
import { trackPageView } from '@/lib/tracking'

interface EditToolPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditToolPage({ params }: EditToolPageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const t = await getTranslations('tools')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/tools/${id}/edit`)
  }

  trackPageView('/tools/[id]/edit', 'tool_edit_page', user.id)

  const tool = await getToolById(id)
  if (!tool) notFound()

  // Only the owner may edit
  if (tool.owner_id !== user.id) {
    notFound()
  }

  const communities = await getUserCommunities(user.id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 data-testid="edit-tool-heading" className="mb-8 text-2xl font-bold text-gray-900">
        {t('editTool')}
      </h1>
      <ToolForm
        mode="edit"
        locale={locale}
        toolId={tool.id}
        initialData={tool}
        communities={communities}
      />
    </div>
  )
}
