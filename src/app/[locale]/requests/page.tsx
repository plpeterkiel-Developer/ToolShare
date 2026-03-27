import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getIncomingRequests, getOutgoingRequests } from '@/lib/queries/requests'
import { RequestTabs } from '@/components/requests/RequestTabs'

interface RequestsPageProps {
  params: Promise<{ locale: string }>
}

export default async function RequestsPage({ params }: RequestsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/auth/login?next=/${locale}/requests`)
  }

  const [incoming, outgoing] = await Promise.all([
    getIncomingRequests(user.id),
    getOutgoingRequests(user.id),
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 data-testid="requests-heading" className="mb-8 text-2xl font-bold text-gray-900">
        Loan Requests
      </h1>
      <RequestTabs
        incoming={incoming}
        outgoing={outgoing}
        currentUserId={user.id}
        locale={locale}
      />
    </div>
  )
}
