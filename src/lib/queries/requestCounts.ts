import { createClient } from '@/lib/supabase/server'

export interface RequestCounts {
  pendingIncoming: number
  activeBorrows: number
}

export async function getRequestCounts(userId: string): Promise<RequestCounts> {
  const supabase = await createClient()

  const [pendingResult, activeResult] = await Promise.all([
    supabase
      .from('borrow_requests')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'pending'),
    supabase
      .from('borrow_requests')
      .select('id', { count: 'exact', head: true })
      .eq('borrower_id', userId)
      .in('status', ['approved', 'overdue']),
  ])

  return {
    pendingIncoming: pendingResult.count ?? 0,
    activeBorrows: activeResult.count ?? 0,
  }
}
