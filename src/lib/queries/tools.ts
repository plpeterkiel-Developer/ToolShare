import { createClient } from '@/lib/supabase/server'
import type { ToolWithOwner } from '@/types/database.types'

interface GetToolsParams {
  search?: string
  category?: string
  limit?: number
  offset?: number
}

export async function getTools({ search, category, limit = 24, offset = 0 }: GetToolsParams = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('tools')
    .select(
      '*, owner:profiles!owner_id(id, display_name, location, avatar_url, is_suspended, warning_count, last_active_at, created_at, updated_at, test_run_id, gdpr_erasure_requested_at, bio)'
    )
    .eq('availability', 'available')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.textSearch('search_vector', search, { type: 'plain', config: 'english' })
  }

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data as ToolWithOwner[]
}

export async function getToolById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tools')
    .select(
      '*, owner:profiles!owner_id(id, display_name, location, avatar_url, is_suspended, warning_count, last_active_at, created_at, updated_at, test_run_id, gdpr_erasure_requested_at, bio)'
    )
    .eq('id', id)
    .single()

  if (error) return null
  return data as ToolWithOwner
}

export async function getToolsByOwner(ownerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tools')
    .select(
      '*, owner:profiles!owner_id(id, display_name, location, avatar_url, is_suspended, warning_count, last_active_at, created_at, updated_at, test_run_id, gdpr_erasure_requested_at, bio)'
    )
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as ToolWithOwner[]
}

export async function getRecentAvailableTools(limit = 6) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tools')
    .select(
      '*, owner:profiles!owner_id(id, display_name, location, avatar_url, is_suspended, warning_count, last_active_at, created_at, updated_at, test_run_id, gdpr_erasure_requested_at, bio)'
    )
    .eq('availability', 'available')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data as ToolWithOwner[]
}
