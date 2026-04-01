import { Before, After, setDefaultTimeout, ITestCaseHookParameter } from '@cucumber/cucumber'
import { CustomWorld } from './world'

setDefaultTimeout(30_000)

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

    // Auth users are NOT deleted — Supabase soft-deletes cause "already registered"
    // errors on recreate. Test users are reused via createTestUser which handles
    // existing users by updating their password and metadata.
  } catch (err) {
    // Cleanup errors should not fail the test suite
    console.error('Cleanup error:', err)
  }
}
