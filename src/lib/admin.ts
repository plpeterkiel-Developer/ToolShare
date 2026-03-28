import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return false

  const adminClient = createAdminClient()
  const { data } = await adminClient.from('admins').select('id').eq('email', user.email).single()

  return !!data
}
