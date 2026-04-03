import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ToolCondition } from '@/types/database.types'
import { trackAction } from '@/lib/tracking'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const formData = await request.formData()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const condition = (formData.get('condition') as ToolCondition) ?? 'good'
  const imageUrl = formData.get('image_url') as string | null
  const communityId = formData.get('community_id') as string | null

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!category?.trim()) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 })
  }

  trackAction('tool_create', user.id, { category })

  if (communityId) {
    const { data: membership } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('community_id', communityId)
      .eq('profile_id', user.id)
      .single()
    if (!membership) {
      return NextResponse.json({ error: 'You are not a member of this community' }, { status: 403 })
    }
  }

  const { error } = await supabase
    .from('tools')
    .insert({
      owner_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      category,
      condition,
      image_url: imageUrl || null,
      community_id: communityId || null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/tools')
  return NextResponse.json({ success: true })
}
