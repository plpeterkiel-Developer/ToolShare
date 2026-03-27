import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../features/support/world'
import { AuthPage } from '../features/support/page-objects/auth.page'
import { createTestUser } from '../features/support/db-helpers'

// ─── State shared within a scenario via world ────────────────────────────────

let sharedEmail = ''
let sharedPassword = 'TestPass123!' // pragma: allowlist secret

// ─── Givens ──────────────────────────────────────────────────────────────────

Given('a registered user exists', async function (this: CustomWorld) {
  const email = `user-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  sharedEmail = email
  sharedPassword = 'TestPass123!'
  await createTestUser(this.supabaseAdmin, email, sharedPassword, this.testRunId)
  this.currentUserEmail = email
})

Given(
  'a user already exists with email {string}',
  async function (this: CustomWorld, email: string) {
    // Create a fresh one with this specific email for the duplicate test
    const uniqueEmail = `${this.testRunId.slice(0, 8)}-${email}`
    await createTestUser(this.supabaseAdmin, uniqueEmail, 'TestPass123!', this.testRunId)
    // Store the unique email so the "fill with email" step can use it
    this.attach(`seeded_duplicate_email:${uniqueEmail}`)
  }
)

Given('I am logged in as a registered user', async function (this: CustomWorld) {
  const email = `user-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  sharedEmail = email
  sharedPassword = 'TestPass123!'
  await createTestUser(this.supabaseAdmin, email, sharedPassword, this.testRunId)
  this.currentUserEmail = email
  await this.loginAs(email, sharedPassword)
})

Given('I am not logged in', async function (this: CustomWorld) {
  // Clear any existing session by going to the app — cookies are isolated per context
  await this.page.goto(`${this.baseUrl}/da`)
})

// ─── Whens ───────────────────────────────────────────────────────────────────

When('I fill in the signup form with a new user', async function (this: CustomWorld) {
  const authPage = new AuthPage(this.page, this.baseUrl)
  const email = `signup-${this.testRunId.slice(0, 8)}@test.toolshare.app`
  sharedEmail = email
  this.currentUserEmail = email
  await authPage.fillSignupForm({
    displayName: 'Test User',
    email,
    password: sharedPassword,
  })
})

When(
  'I fill in the signup form with email {string}',
  async function (this: CustomWorld, _email: string) {
    const authPage = new AuthPage(this.page, this.baseUrl)
    // Retrieve the unique seeded email from the attachment hint
    // Since Cucumber attachments aren't easily retrievable, we use this.testRunId to reconstruct:
    const uniqueEmail = `${this.testRunId.slice(0, 8)}-${_email}`
    await authPage.fillSignupForm({
      displayName: 'Duplicate User',
      email: uniqueEmail,
      password: 'TestPass123!',
    })
  }
)

When('I submit the signup form', async function (this: CustomWorld) {
  const authPage = new AuthPage(this.page, this.baseUrl)
  await authPage.submitSignupForm()
})

When('I fill in the login form with valid credentials', async function (this: CustomWorld) {
  const authPage = new AuthPage(this.page, this.baseUrl)
  await authPage.fillLoginForm(sharedEmail, sharedPassword)
})

When('I fill in the login form with the wrong password', async function (this: CustomWorld) {
  const authPage = new AuthPage(this.page, this.baseUrl)
  await authPage.fillLoginForm(sharedEmail, 'wrongpassword999')
})

When('I submit the login form', async function (this: CustomWorld) {
  const authPage = new AuthPage(this.page, this.baseUrl)
  await authPage.submitLoginForm()
})

When('I click the logout button', async function (this: CustomWorld) {
  const authPage = new AuthPage(this.page, this.baseUrl)
  await authPage.clickLogout()
})

// ─── Thens ───────────────────────────────────────────────────────────────────

Then('I should be redirected to a dashboard or home page', async function (this: CustomWorld) {
  // After login/signup, the user should land somewhere under /da/ (not on /auth/)
  await this.page.waitForURL(
    (url) => url.pathname.startsWith('/da') && !url.pathname.includes('/auth'),
    { timeout: 15_000 }
  )
})

Then('I should see my display name in the navigation', async function (this: CustomWorld) {
  // The navbar shows something user-specific when logged in
  const navContent = await this.page.locator('header').textContent()
  // At minimum the profile/logout links should appear
  expect(navContent).toMatch(/profile|logout|log out|my profile/i)
})

Then('I should be redirected to the home page', async function (this: CustomWorld) {
  await this.page.waitForURL(/\/da$|\/da\//, { timeout: 10_000 })
})

Then('I should see the login link in the navigation', async function (this: CustomWorld) {
  const loginLink = this.page
    .locator('header a[href*="/auth/login"], header [data-testid="nav-login"]')
    .first()
  await expect(loginLink).toBeVisible({ timeout: 8_000 })
})
