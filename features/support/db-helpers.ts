import { SupabaseClient } from '@supabase/supabase-js'

export interface TestUser {
  id: string
  email: string
}

/**
 * Creates a confirmed auth user with test_run_id in metadata and upserts a profile row.
 */
export async function createTestUser(
  supabaseAdmin: SupabaseClient,
  email: string,
  password: string,
  testRunId: string
): Promise<TestUser> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { test_run_id: testRunId },
  })

  let userId: string

  if (error && error.message?.includes('already been registered')) {
    // User exists from a previous run. Append a unique suffix and create a fresh user instead.
    const uniqueEmail = email.replace('@', `-${Date.now()}@`)
    const { data: retryData, error: retryError } = await supabaseAdmin.auth.admin.createUser({
      email: uniqueEmail,
      password,
      email_confirm: true,
      user_metadata: { test_run_id: testRunId, original_email: email },
    })
    if (retryError || !retryData?.user) {
      throw new Error(`Failed to create test user ${uniqueEmail}: ${retryError?.message}`)
    }
    userId = retryData.user.id
    // Update password and metadata for this test run
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      user_metadata: { test_run_id: testRunId },
    })
    // Clean leftover data
    await supabaseAdmin
      .from('borrow_requests')
      .delete()
      .or(`borrower_id.eq.${userId},owner_id.eq.${userId}`)
    await supabaseAdmin.from('tools').delete().eq('owner_id', userId)
  } else if (error || !data?.user) {
    throw new Error(`Failed to create test user ${email}: ${error?.message}`)
  } else {
    userId = data.user.id
  }

  // Upsert profile row
  const displayName = email.split('@')[0]
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    display_name: displayName,
    test_run_id: testRunId,
  })

  if (profileError) {
    throw new Error(`Failed to upsert profile for ${email}: ${profileError.message}`)
  }

  return { id: userId, email }
}

export interface SeedToolInput {
  name: string
  category: string
  description?: string
  condition?: 'good' | 'fair' | 'worn'
  availability?: 'available' | 'on_loan' | 'unavailable'
  ownerEmail?: string
  ownerPassword?: string
}

export interface SeededTool {
  id: string
  name: string
  ownerId: string
  ownerEmail: string
}

/**
 * Seeds one or more tools. Each tool can specify an owner email, or uses the defaultOwnerEmail.
 * Creates the owner users as needed.
 */
export async function seedTools(
  supabaseAdmin: SupabaseClient,
  tools: SeedToolInput[],
  testRunId: string,
  defaultOwnerEmail?: string
): Promise<SeededTool[]> {
  const userCache = new Map<string, TestUser>()

  async function getOrCreateUser(email: string): Promise<TestUser> {
    if (userCache.has(email)) return userCache.get(email)!
    const password = 'TestPass123!' // pragma: allowlist secret
    const user = await createTestUser(supabaseAdmin, email, password, testRunId)
    userCache.set(email, user)
    return user
  }

  const seeded: SeededTool[] = []

  for (const toolInput of tools) {
    const ownerEmail =
      toolInput.ownerEmail ??
      defaultOwnerEmail ??
      `owner-${testRunId.slice(0, 8)}@test.toolshare.app`

    const owner = await getOrCreateUser(ownerEmail)

    const { data, error } = await supabaseAdmin
      .from('tools')
      .insert({
        owner_id: owner.id,
        name: toolInput.name,
        category: toolInput.category,
        description: toolInput.description ?? null,
        condition: toolInput.condition ?? 'good',
        availability: toolInput.availability ?? 'available',
        test_run_id: testRunId,
      })
      .select('id')
      .single()

    if (error || !data) {
      throw new Error(`Failed to seed tool "${toolInput.name}": ${error?.message}`)
    }

    seeded.push({
      id: data.id,
      name: toolInput.name,
      ownerId: owner.id,
      ownerEmail: owner.email,
    })
  }

  return seeded
}

export interface SeedBorrowRequestParams {
  supabaseAdmin: SupabaseClient
  toolId: string
  borrowerId: string
  ownerId: string
  testRunId: string
  message?: string
  status?: 'pending' | 'approved' | 'denied' | 'cancelled' | 'returned' | 'overdue'
  startDate?: string
  endDate?: string
}

/**
 * Inserts a borrow_request row tagged with test_run_id.
 */
export async function seedBorrowRequest(params: SeedBorrowRequestParams): Promise<string> {
  const {
    supabaseAdmin,
    toolId,
    borrowerId,
    ownerId,
    testRunId,
    message,
    status = 'pending',
    startDate,
    endDate,
  } = params

  const { data, error } = await supabaseAdmin
    .from('borrow_requests')
    .insert({
      tool_id: toolId,
      borrower_id: borrowerId,
      owner_id: ownerId,
      status,
      message: message ?? null,
      start_date: startDate ?? null,
      end_date: endDate ?? null,
      test_run_id: testRunId,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(`Failed to seed borrow request: ${error?.message}`)
  }

  return data.id
}
