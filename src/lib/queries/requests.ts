import { createClient } from '@/lib/supabase/server'
import type { RequestWithDetails } from '@/types/database.types'

const REQUEST_SELECT = `
  *,
  tool:tools(*),
  borrower:profiles!borrower_id(id, display_name, avatar_url, location, bio),
  owner:profiles!owner_id(id, display_name, avatar_url, location, bio)
`

export async function getIncomingRequests(ownerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('borrow_requests')
    .select(REQUEST_SELECT)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as RequestWithDetails[]
}

export async function getOutgoingRequests(borrowerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('borrow_requests')
    .select(REQUEST_SELECT)
    .eq('borrower_id', borrowerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as RequestWithDetails[]
}

export async function getRequestById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('borrow_requests')
    .select(REQUEST_SELECT)
    .eq('id', id)
    .single()

  if (error) return null
  return data as RequestWithDetails
}

export async function getPendingRequestsForTool(toolId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('borrow_requests')
    .select('id')
    .eq('tool_id', toolId)
    .in('status', ['pending', 'approved'])
    .limit(1)

  if (error) throw new Error(error.message)
  return data
}
