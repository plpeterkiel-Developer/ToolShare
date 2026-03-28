import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllUsers } from '@/lib/queries/admin'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'

interface AdminUsersPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminUsersPage({ params }: AdminUsersPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('admin.users')
  const users = await getAllUsers()

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <div className="rounded-lg border border-gray-200 bg-white">
        <AdminUsersTable users={users} />
      </div>
    </div>
  )
}
