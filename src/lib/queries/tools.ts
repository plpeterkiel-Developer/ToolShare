import { createClient } from '@/lib/supabase/server'
import type { ToolWithOwner } from '@/types/database.types'

interface GetToolsParams {
  search?: string
  category?: string
  lat?: number
  lng?: number
  radiusKm?: number
  limit?: number
  offset?: number
}

export async function getTools({
  search,
  category,
  lat,
  lng,
  radiusKm,
  limit = 24,
  offset = 0,
}: GetToolsParams = {}) {
  const supabase = await createClient()

  // When location filter is active, use the RPC for distance-based search
  if (lat != null && lng != null && radiusKm != null) {
    return getToolsWithinRadius({ lat, lng, radiusKm, search, category, limit, offset })
  }

  let query = supabase
    .from('tools')
    .select(
      '*, owner:profiles!owner_id(id, display_name, location, latitude, longitude, avatar_url, is_suspended, warning_count, last_active_at, created_at, updated_at, test_run_id, gdpr_erasure_requested_at, bio)'
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

async function getToolsWithinRadius({
  lat,
  lng,
  radiusKm,
  search,
  category,
  limit,
  offset,
}: {
  lat: number
  lng: number
  radiusKm: number
  search?: string
  category?: string
  limit: number
  offset: number
}) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rpcRows, error: rpcError } = await (supabase.rpc as any)('tools_within_radius', {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: radiusKm,
    p_search: search ?? null,
    p_category: category ?? null,
    p_limit: limit,
    p_offset: offset,
  }) as { data: Record<string, unknown>[] | null; error: { message: string } | null }

  if (rpcError) throw new Error(rpcError.message)
  if (!rpcRows || rpcRows.length === 0) return [] as ToolWithOwner[]

  // The RPC returns flat tool rows; we still need owner profiles for the UI
  const ownerIds = [...new Set(rpcRows.map((r) => r.owner_id as string))]
  const { data: owners, error: ownerError } = await supabase
    .from('profiles')
    .select(
      'id, display_name, location, latitude, longitude, avatar_url, is_suspended, warning_count, last_active_at, created_at, updated_at, test_run_id, gdpr_erasure_requested_at, bio'
    )
    .in('id', ownerIds)

  if (ownerError) throw new Error(ownerError.message)

  const ownerMap = new Map((owners as { id: string }[] ?? []).map((o) => [o.id, o]))

  return rpcRows.map((row) => ({
    id: row.id,
    owner_id: row.owner_id,
    name: row.name,
    description: row.description,
    category: row.category,
    condition: row.condition,
    image_url: row.image_url,
    availability: row.availability,
    created_at: row.created_at,
    updated_at: row.updated_at,
    test_run_id: row.test_run_id,
    owner: ownerMap.get(row.owner_id as string) ?? null,
  })) as ToolWithOwner[]
}

export async function getToolById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tools')
    .select(
      '*, owner:profiles!owner_id(id, display_name, location, latitude, longitude, avatar_url, is_suspended, warning_count, last_active_at, created_at, updated_at, test_run_id, gdpr_erasure_requested_at, bio)'
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
      '*, owner:profiles!owner_id(id, display_name, location, latitude, longitude, avatar_url, is_suspended, warning_count, last_active_at, created_at, updated_at, test_run_id, gdpr_erasure_requested_at, bio)'
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
      '*, owner:profiles!owner_id(id, display_name, location, latitude, longitude, avatar_url, is_suspended, warning_count, last_active_at, created_at, updated_at, test_run_id, gdpr_erasure_requested_at, bio)'
    )
    .eq('availability', 'available')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data as ToolWithOwner[]
}
