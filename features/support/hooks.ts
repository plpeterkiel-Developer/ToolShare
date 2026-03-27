import { Before, After, ITestCaseHookParameter } from '@cucumber/cucumber'
import { CustomWorld } from './world'

Before(async function (this: CustomWorld) {
  await this.init()
})

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  // Screenshot on failure
  if (scenario.result?.status === 'FAILED') {
    try {
      const screenshot = await this.page.screenshot({ fullPage: true })
      this.attach(screenshot, 'image/png')
    } catch {
      // If page is not available, skip screenshot
    }
  }

  // Clean up test data seeded during the test
  await cleanupTestData(this)

  await this.teardown()
})

async function cleanupTestData(world: CustomWorld): Promise<void> {
  const { testRunId, supabaseAdmin } = world

  try {
    // Delete borrow_requests created in this test run
    await supabaseAdmin.from('borrow_requests').delete().eq('test_run_id', testRunId)

    // Delete tools created in this test run
    await supabaseAdmin.from('tools').delete().eq('test_run_id', testRunId)

    // Delete profiles created in this test run
    await supabaseAdmin.from('profiles').delete().eq('test_run_id', testRunId)

    // Delete auth users whose metadata contains this test_run_id.
    // We list users and filter by metadata since Supabase Admin API
    // doesn't support filtering by metadata directly.
    const { data: usersPage } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    const testUsers = (usersPage?.users ?? []).filter(
      (u) => u.user_metadata?.test_run_id === testRunId
    )

    for (const user of testUsers) {
      await supabaseAdmin.auth.admin.deleteUser(user.id)
    }
  } catch (err) {
    // Cleanup errors should not fail the test suite
    console.error('Cleanup error:', err)
  }
}
