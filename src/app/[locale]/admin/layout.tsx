import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { isCurrentUserAdmin } from '@/lib/admin'
import { countPendingCreationRequests } from '@/lib/queries/communities'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const admin = await isCurrentUserAdmin()
  if (!admin) {
    redirect(`/${locale}`)
  }

  const pendingCreationRequestsCount = await countPendingCreationRequests()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <AdminSidebar locale={locale} pendingCreationRequestsCount={pendingCreationRequestsCount} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
