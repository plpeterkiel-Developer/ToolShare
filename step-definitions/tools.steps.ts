import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld, DEFAULT_TIMEOUT } from '../features/support/world'
import { ToolsPage } from '../features/support/page-objects/tools.page'
import { createTestUser, seedTools } from '../features/support/db-helpers'

// ─── Givens ──────────────────────────────────────────────────────────────────

Given('tools have been seeded in the database', async function (this: CustomWorld) {
  const seeded = await seedTools(
    this.supabaseAdmin,
    [
      { name: 'Seeded Drill', category: 'Power Tools', availability: 'available' },
      { name: 'Seeded Spade', category: 'Gardening', availability: 'available' },
    ],
    this.testRunId
  )
  for (const tool of seeded) {
    this.registerSeededTool(tool.name, tool.id)
  }
})

Given('I am logged in as the tool owner', async function (this: CustomWorld) {
  const email = `owner-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  await createTestUser(this.supabaseAdmin, email, 'TestPass123!', this.testRunId)
  this.currentUserEmail = email

  const seeded = await seedTools(
    this.supabaseAdmin,
    [{ name: 'Owner Tool', category: 'Hand Tools', availability: 'available' }],
    this.testRunId,
    email
  )
  this.registerSeededTool('Owner Tool', seeded[0].id)

  await this.loginAs(email, 'TestPass123!')
})

Given('I am logged in as a different user', async function (this: CustomWorld) {
  // Owner of the existing seeded tools
  const ownerEmail = `owner2-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  await createTestUser(this.supabaseAdmin, ownerEmail, 'TestPass123!', this.testRunId)

  const seeded = await seedTools(
    this.supabaseAdmin,
    [{ name: 'Other Person Tool', category: 'Gardening', availability: 'available' }],
    this.testRunId,
    ownerEmail
  )
  this.registerSeededTool('Other Person Tool', seeded[0].id)

  // Now create and log in as a different user who does NOT own the tool
  const email = `visitor-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  await createTestUser(this.supabaseAdmin, email, 'TestPass123!', this.testRunId)
  this.currentUserEmail = email
  await this.loginAs(email, 'TestPass123!')
})

Given('I have a tool listed called {string}', async function (this: CustomWorld, toolName: string) {
  const email = this.currentUserEmail || `owner-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  const seeded = await seedTools(
    this.supabaseAdmin,
    [{ name: toolName, category: 'Hand Tools', availability: 'available' }],
    this.testRunId,
    email
  )
  this.registerSeededTool(toolName, seeded[0].id)
})

Given(
  'there is an active borrow request for {string}',
  async function (this: CustomWorld, toolName: string) {
    const toolId = this.getSeededToolId(toolName)
    if (!toolId) throw new Error(`No seeded tool found with name "${toolName}"`)

    // Create a borrower and insert a pending request directly via admin
    const borrowerEmail = `borrower-${this.testRunId.slice(0, 8)}@test.toolshare.app`
    const { id: borrowerId } = await createTestUser(
      this.supabaseAdmin,
      borrowerEmail,
      'TestPass123!',
      this.testRunId
    )

    // Fetch owner_id from the tool
    const { data: tool } = await this.supabaseAdmin
      .from('tools')
      .select('owner_id')
      .eq('id', toolId)
      .single()

    if (!tool) throw new Error(`Could not find tool "${toolName}" in DB`)

    await this.supabaseAdmin.from('borrow_requests').insert({
      tool_id: toolId,
      borrower_id: borrowerId,
      owner_id: tool.owner_id,
      status: 'pending',
      test_run_id: this.testRunId,
    })
  }
)

// ─── Whens ───────────────────────────────────────────────────────────────────

When('I navigate to the detail page of a seeded tool', async function (this: CustomWorld) {
  const toolId = this.getSeededToolId('Seeded Drill')
  if (!toolId) throw new Error('No seeded tool registered')
  const toolsPage = new ToolsPage(this.page, this.baseUrl)
  await toolsPage.navigateToDetail(toolId)
})

When('I navigate to the detail page of their tool', async function (this: CustomWorld) {
  const toolId = this.getSeededToolId('Owner Tool')
  if (!toolId) throw new Error('No owner tool registered')
  const toolsPage = new ToolsPage(this.page, this.baseUrl)
  await toolsPage.navigateToDetail(toolId)
})

When(
  'I navigate to the detail page of a seeded tool owned by someone else',
  async function (this: CustomWorld) {
    const toolId = this.getSeededToolId('Other Person Tool')
    if (!toolId) throw new Error('No other-person tool registered')
    const toolsPage = new ToolsPage(this.page, this.baseUrl)
    await toolsPage.navigateToDetail(toolId)
  }
)

When(
  'I fill in the tool form with name {string} and category {string}',
  async function (this: CustomWorld, name: string, category: string) {
    const toolsPage = new ToolsPage(this.page, this.baseUrl)
    await toolsPage.fillToolForm({ name, category })
  }
)

When('I submit the tool form', async function (this: CustomWorld) {
  const toolsPage = new ToolsPage(this.page, this.baseUrl)
  await toolsPage.submitToolForm()
})

When('I submit the tool form without a name', async function (this: CustomWorld) {
  const toolsPage = new ToolsPage(this.page, this.baseUrl)
  await toolsPage.clearToolNameField()
  await toolsPage.submitToolForm()
})

When(
  'I navigate to the edit page of {string}',
  async function (this: CustomWorld, toolName: string) {
    const toolId = this.getSeededToolId(toolName)
    if (!toolId) throw new Error(`No seeded tool found with name "${toolName}"`)
    const toolsPage = new ToolsPage(this.page, this.baseUrl)
    await toolsPage.navigateToEdit(toolId)
  }
)

When('I change the tool name to {string}', async function (this: CustomWorld, newName: string) {
  const toolsPage = new ToolsPage(this.page, this.baseUrl)
  await toolsPage.fillToolForm({ name: newName })
})

When(
  'I set the availability to {string}',
  async function (this: CustomWorld, availability: string) {
    const toolsPage = new ToolsPage(this.page, this.baseUrl)
    await toolsPage.fillToolForm({ availability })
  }
)

When(
  'I navigate to the detail page of {string}',
  async function (this: CustomWorld, toolName: string) {
    const toolId = this.getSeededToolId(toolName)
    if (!toolId) throw new Error(`No seeded tool found with name "${toolName}"`)
    const toolsPage = new ToolsPage(this.page, this.baseUrl)
    await toolsPage.navigateToDetail(toolId)
  }
)

When('I click the delete button', async function (this: CustomWorld) {
  const toolsPage = new ToolsPage(this.page, this.baseUrl)
  await toolsPage.clickDeleteButton()
})

When('I confirm the deletion', async function (this: CustomWorld) {
  const toolsPage = new ToolsPage(this.page, this.baseUrl)
  await toolsPage.confirmDeletion()
})

// ─── Thens ───────────────────────────────────────────────────────────────────

Then('I should see the tools listing page', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="tools-heading"]')).toBeVisible({ timeout: DEFAULT_TIMEOUT })
})

Then('I should see at least one tool card', async function (this: CustomWorld) {
  const toolsPage = new ToolsPage(this.page, this.baseUrl)
  const count = await toolsPage.getToolCardCount()
  expect(count).toBeGreaterThan(0)
})

Then('I should see the tool name', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="tool-detail-name"]')).toBeVisible({
    timeout: 8_000,
  })
})

Then('I should see the tool category', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="tool-detail-category"]')).toBeVisible()
})

Then('I should see the tool condition', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="tool-detail-condition"]')).toBeVisible()
})

Then("I should see the owner's name", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="tool-owner-link"]')).toBeVisible()
})

Then('I should see the edit button', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="edit-tool-link"]')).toBeVisible({ timeout: DEFAULT_TIMEOUT })
})

Then('I should see the delete button', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="delete-tool-button"]')).toBeVisible()
})

Then('I should not see the borrow request button', async function (this: CustomWorld) {
  const btn = this.page.locator('[data-testid="request-to-borrow-button"]')
  await expect(btn).toHaveCount(0)
})

Then('I should not see the edit button', async function (this: CustomWorld) {
  const btn = this.page.locator('[data-testid="edit-tool-link"]')
  await expect(btn).toHaveCount(0)
})

Then('I should not see the delete button', async function (this: CustomWorld) {
  const btn = this.page.locator('[data-testid="delete-tool-button"]')
  await expect(btn).toHaveCount(0)
})

Then('I should see the request to borrow button', async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="request-to-borrow-button"]')).toBeVisible({
    timeout: 8_000,
  })
})

Then('I should be redirected to the tool detail page', async function (this: CustomWorld) {
  await this.page.waitForURL(/\/da\/tools\/[^/]+$/, { timeout: DEFAULT_TIMEOUT * 1.5 })
})

Then('I should be redirected to the tools listing page', async function (this: CustomWorld) {
  await this.page.waitForURL(/\/da\/tools$/, { timeout: DEFAULT_TIMEOUT * 1.5 })
})

Then('I should see a validation error for the name field', async function (this: CustomWorld) {
  // The browser's built-in required validation fires, or our server error shows
  const nameInput = this.page.locator('[data-testid="tool-name"]')
  const isInvalid = await nameInput.evaluate((el) => !(el as HTMLInputElement).validity.valid)
  if (!isInvalid) {
    // Check for our server-side error message
    const errEl = this.page.locator('[data-testid="tool-form-error"]')
    await expect(errEl).toBeVisible({ timeout: DEFAULT_TIMEOUT })
  } else {
    expect(isInvalid).toBe(true)
  }
})

Then('I should see the unavailable badge', async function (this: CustomWorld) {
  await expect(this.page.locator('text=Unavailable').first()).toBeVisible({ timeout: DEFAULT_TIMEOUT })
})

Then('the tool should still exist', async function (this: CustomWorld) {
  const url = this.page.url()
  // Should still be on the tool page or an error was shown
  expect(url).toMatch(/\/da\/tools\//)
})
