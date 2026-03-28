import { createAdminClient } from '@/lib/supabase/admin'

export async function getAdminDashboardStats() {
  const supabase = createAdminClient()

  const [users, tools, activeLoans, openReports] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('tools').select('id', { count: 'exact', head: true }),
    supabase
      .from('borrow_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['approved']),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('resolved', false),
  ])

  return {
    totalUsers: users.count ?? 0,
    totalTools: tools.count ?? 0,
    activeLoans: activeLoans.count ?? 0,
    openReports: openReports.count ?? 0,
  }
}

export async function getAllUsers() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Fetch emails from auth for each user
  const usersWithEmail = await Promise.all(
    (data ?? []).map(async (profile) => {
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
      return {
        ...profile,
        email: authUser?.user?.email ?? null,
      }
    })
  )

  return usersWithEmail
}

export async function getAllTools() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tools')
    .select('*, owner:profiles!owner_id(id, display_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllReports() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('reports')
    .select(
      '*, reporter:profiles!reporter_id(id, display_name), reported_user:profiles!reported_user_id(id, display_name), reported_tool:tools!reported_tool_id(id, name)'
    )
    .order('resolved', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllRequests() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('borrow_requests')
    .select(
      '*, tool:tools(id, name), borrower:profiles!borrower_id(id, display_name), owner:profiles!owner_id(id, display_name)'
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
