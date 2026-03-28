import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld, DEFAULT_TIMEOUT } from '../features/support/world'

Given('the application is running', async function (this: CustomWorld) {
  // Verify the app responds — navigate to home as a health check
  await this.page.goto(`${this.baseUrl}/da`)
  await expect(this.page).toHaveURL(/\/da/, { timeout: DEFAULT_TIMEOUT * 2 })
})

When('I navigate to {string}', async function (this: CustomWorld, path: string) {
  await this.page.goto(`${this.baseUrl}${path}`)
})

Then('I should see {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page.locator(`text=${text}`).first()).toBeVisible({ timeout: DEFAULT_TIMEOUT })
})

Then('I should not see {string}', async function (this: CustomWorld, text: string) {
  // Either the element doesn't exist, or it's hidden
  const count = await this.page.locator(`text=${text}`).count()
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      const el = this.page.locator(`text=${text}`).nth(i)
      const visible = await el.isVisible()
      if (visible) {
        throw new Error(`Expected not to see "${text}" but it is visible on the page`)
      }
    }
  }
})

Then('I should be redirected to the login page', async function (this: CustomWorld) {
  await this.page.waitForURL(/\/auth\/login/, { timeout: DEFAULT_TIMEOUT })
  await expect(this.page.locator('[data-testid="login-submit"]')).toBeVisible()
})

Then(
  'I should see an error message containing {string}',
  async function (this: CustomWorld, text: string) {
    const errorLocator = this.page
      .locator(
        '[role="alert"], [data-testid="error-message"], [data-testid="tool-form-error"], [data-testid="delete-tool-error"], [data-testid="request-error"]'
      )
      .first()

    await expect(errorLocator).toBeVisible({ timeout: DEFAULT_TIMEOUT })
    const errorText = await errorLocator.textContent()
    expect(errorText?.toLowerCase()).toContain(text.toLowerCase())
  }
)

Then('I should see a success notification', async function (this: CustomWorld) {
  await expect(
    this.page.locator('[data-testid="toast-success"], [role="status"]').first()
  ).toBeVisible({ timeout: DEFAULT_TIMEOUT })
})
