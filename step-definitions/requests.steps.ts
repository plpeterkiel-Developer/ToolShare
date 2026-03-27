import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../features/support/world'
import { RequestsPage } from '../features/support/page-objects/requests.page'
import { createTestUser, seedTools, seedBorrowRequest } from '../features/support/db-helpers'

// ─── Shared state ────────────────────────────────────────────────────────────

let borrowerEmail = ''
const borrowerPassword = 'TestPass123!' // pragma: allowlist secret
let ownerEmail = ''
let sharedToolId = ''
let sharedRequestId = ''

// ─── Givens ──────────────────────────────────────────────────────────────────

Given('I am logged in as a borrower', async function (this: CustomWorld) {
  borrowerEmail = `borrower-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  await createTestUser(this.supabaseAdmin, borrowerEmail, borrowerPassword, this.testRunId)
  this.currentUserEmail = borrowerEmail
  await this.loginAs(borrowerEmail, borrowerPassword)
})

Given('there is an available tool owned by a different user', async function (this: CustomWorld) {
  ownerEmail = `toolowner-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  const seeded = await seedTools(
    this.supabaseAdmin,
    [{ name: 'Borrowable Hammer', category: 'Hand Tools', availability: 'available' }],
    this.testRunId,
    ownerEmail
  )
  sharedToolId = seeded[0].id
  this.registerSeededTool('Borrowable Hammer', sharedToolId)
})

Given('there is a pending borrow request for my tool', async function (this: CustomWorld) {
  // The owner should already be logged in; create a borrower and a request
  const toolOwnerEmail = this.currentUserEmail
  if (!toolOwnerEmail) throw new Error('No current user email — log in as owner first')

  // Seed a tool for this owner
  const seeded = await seedTools(
    this.supabaseAdmin,
    [{ name: 'Requested Tool', category: 'Hand Tools', availability: 'available' }],
    this.testRunId,
    toolOwnerEmail
  )
  const toolId = seeded[0].id
  const ownerId = seeded[0].ownerId
  sharedToolId = toolId
  this.registerSeededTool('Requested Tool', toolId)

  // Create borrower
  const bEmail = `borrower2-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  const { id: borrowerId } = await createTestUser(
    this.supabaseAdmin,
    bEmail,
    borrowerPassword,
    this.testRunId
  )

  sharedRequestId = await seedBorrowRequest({
    supabaseAdmin: this.supabaseAdmin,
    toolId,
    borrowerId,
    ownerId,
    testRunId: this.testRunId,
    message: 'I need this hammer please',
    status: 'pending',
  })
})

Given('I have submitted a borrow request', async function (this: CustomWorld) {
  // Ensure we have a tool from another user and a pending request from current user
  const toolOwnerEmail = `reqowner-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  const seeded = await seedTools(
    this.supabaseAdmin,
    [{ name: 'My Requested Tool', category: 'Gardening', availability: 'available' }],
    this.testRunId,
    toolOwnerEmail
  )
  sharedToolId = seeded[0].id
  this.registerSeededTool('My Requested Tool', sharedToolId)

  // Get borrower user id
  const { data: borrowerProfile } = await this.supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('test_run_id', this.testRunId)
    .eq('display_name', borrowerEmail.split('@')[0])
    .maybeSingle()

  if (!borrowerProfile) {
    // Fallback: look up by email prefix
    const { data: authUsers } = await this.supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    })
    const borrower = authUsers.users.find(
      (u) => u.email === borrowerEmail && u.user_metadata?.test_run_id === this.testRunId
    )
    if (!borrower) throw new Error('Could not find borrower user')
    sharedRequestId = await seedBorrowRequest({
      supabaseAdmin: this.supabaseAdmin,
      toolId: sharedToolId,
      borrowerId: borrower.id,
      ownerId: seeded[0].ownerId,
      testRunId: this.testRunId,
      status: 'pending',
    })
  } else {
    sharedRequestId = await seedBorrowRequest({
      supabaseAdmin: this.supabaseAdmin,
      toolId: sharedToolId,
      borrowerId: borrowerProfile.id,
      ownerId: seeded[0].ownerId,
      testRunId: this.testRunId,
      status: 'pending',
    })
  }
})

Given('a borrow request has been approved for a tool', async function (this: CustomWorld) {
  const ownerEmail2 = `approved-owner-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  const borrowerEmail2 = `approved-borrower-${this.testRunId.slice(0, 8)}@test.toolshare.app`

  const seeded = await seedTools(
    this.supabaseAdmin,
    [{ name: 'Approved Tool', category: 'Hand Tools', availability: 'on_loan' }],
    this.testRunId,
    ownerEmail2
  )
  sharedToolId = seeded[0].id
  this.registerSeededTool('Approved Tool', sharedToolId)

  const { id: borrowerId } = await createTestUser(
    this.supabaseAdmin,
    borrowerEmail2,
    'TestPass123!',
    this.testRunId
  )

  await seedBorrowRequest({
    supabaseAdmin: this.supabaseAdmin,
    toolId: sharedToolId,
    borrowerId,
    ownerId: seeded[0].ownerId,
    testRunId: this.testRunId,
    status: 'approved',
  })
})

Given('I have a pending outgoing borrow request', async function (this: CustomWorld) {
  // Reuse the "I have submitted a borrow request" setup
  const toolOwnerEmail = `pendingowner-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  const seeded = await seedTools(
    this.supabaseAdmin,
    [{ name: 'Pending Tool', category: 'Gardening', availability: 'available' }],
    this.testRunId,
    toolOwnerEmail
  )
  sharedToolId = seeded[0].id

  const { data: authUsers } = await this.supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  })
  const borrower = authUsers.users.find(
    (u) => u.email === borrowerEmail && u.user_metadata?.test_run_id === this.testRunId
  )
  if (!borrower) throw new Error('Could not find borrower user for pending request')

  sharedRequestId = await seedBorrowRequest({
    supabaseAdmin: this.supabaseAdmin,
    toolId: sharedToolId,
    borrowerId: borrower.id,
    ownerId: seeded[0].ownerId,
    testRunId: this.testRunId,
    status: 'pending',
  })
})

// ─── Whens ───────────────────────────────────────────────────────────────────

When('I navigate to the tool detail page', async function (this: CustomWorld) {
  if (!sharedToolId) throw new Error('No sharedToolId set')
  await this.page.goto(`${this.baseUrl}/da/tools/${sharedToolId}`)
})

When('I click the request to borrow button', async function (this: CustomWorld) {
  const requestsPage = new RequestsPage(this.page, this.baseUrl)
  await requestsPage.openBorrowRequestModal()
})

When('I fill in the borrow request form', async function (this: CustomWorld) {
  const requestsPage = new RequestsPage(this.page, this.baseUrl)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  await requestsPage.fillBorrowRequestForm({
    startDate: tomorrow.toISOString().split('T')[0],
    endDate: nextWeek.toISOString().split('T')[0],
    message: 'I need this tool for a project',
  })
})

When('I submit the borrow request', async function (this: CustomWorld) {
  const requestsPage = new RequestsPage(this.page, this.baseUrl)
  await requestsPage.submitBorrowRequest()
})

When('I click the approve button for the pending request', async function (this: CustomWorld) {
  const requestsPage = new RequestsPage(this.page, this.baseUrl)
  await requestsPage.clickApproveButton()
})

When('I click the deny button for the pending request', async function (this: CustomWorld) {
  const requestsPage = new RequestsPage(this.page, this.baseUrl)
  await requestsPage.clickDenyButton()
})

When('I click the outgoing tab', async function (this: CustomWorld) {
  const requestsPage = new RequestsPage(this.page, this.baseUrl)
  await requestsPage.clickOutgoingTab()
})

When('I click the cancel request button', async function (this: CustomWorld) {
  const requestsPage = new RequestsPage(this.page, this.baseUrl)
  await requestsPage.clickCancelButton()
})

// ─── Thens ───────────────────────────────────────────────────────────────────

Then('I should see a request sent confirmation', async function (this: CustomWorld) {
  const requestsPage = new RequestsPage(this.page, this.baseUrl)
  const confirmed = await requestsPage.getBorrowRequestSuccess()
  expect(confirmed).toBe(true)
})

Then('the request should appear in my outgoing requests', async function (this: CustomWorld) {
  await this.page.goto(`${this.baseUrl}/da/requests`)
  const requestsPage = new RequestsPage(this.page, this.baseUrl)
  await requestsPage.clickOutgoingTab()
  const count = await requestsPage.getRequestCards()
  expect(count).toBeGreaterThan(0)
})

Then(
  'the request status should change to {string}',
  async function (this: CustomWorld, expectedStatus: string) {
    const requestsPage = new RequestsPage(this.page, this.baseUrl)
    await requestsPage.waitForStatusChange(expectedStatus)
  }
)

Then('I should see my borrow request in the list', async function (this: CustomWorld) {
  const requestsPage = new RequestsPage(this.page, this.baseUrl)
  const count = await requestsPage.getRequestCards()
  expect(count).toBeGreaterThan(0)
})

Then('I should see the on loan badge', async function (this: CustomWorld) {
  await expect(this.page.locator('text=On Loan').first()).toBeVisible({ timeout: 8_000 })
})
