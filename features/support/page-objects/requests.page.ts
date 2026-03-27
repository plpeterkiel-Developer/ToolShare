import type { Page } from '@playwright/test'

export class RequestsPage {
  constructor(
    private page: Page,
    private baseUrl: string
  ) {}

  async navigate(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/da/requests`)
  }

  async clickIncomingTab(): Promise<void> {
    await this.page.click('[data-testid="tab-incoming"]')
  }

  async clickOutgoingTab(): Promise<void> {
    await this.page.click('[data-testid="tab-outgoing"]')
  }

  async getRequestCards(): Promise<number> {
    return this.page.locator('[data-testid="request-card"]').count()
  }

  async getFirstRequestStatus(): Promise<string | null> {
    const statusEl = this.page
      .locator('[data-testid="request-card"]')
      .first()
      .locator('.rounded-full')
      .first()
    if (await statusEl.isVisible()) return statusEl.textContent()
    return null
  }

  async getRequestStatusById(requestId: string): Promise<string | null> {
    const card = this.page.locator(`[data-request-id="${requestId}"]`)
    const statusEl = card.locator('.rounded-full').first()
    if (await statusEl.isVisible()) return statusEl.textContent()
    return null
  }

  async clickApproveButton(): Promise<void> {
    await this.page.click('[data-testid="approve-button"]')
    await this.page.waitForLoadState('networkidle')
  }

  async clickDenyButton(): Promise<void> {
    await this.page.click('[data-testid="deny-button"]')
    await this.page.waitForLoadState('networkidle')
  }

  async clickCancelButton(): Promise<void> {
    await this.page.click('[data-testid="cancel-button"]')
    await this.page.waitForLoadState('networkidle')
  }

  async openBorrowRequestModal(): Promise<void> {
    await this.page.click('[data-testid="request-to-borrow-button"]')
    await this.page.waitForSelector('[data-testid="request-submit"]', { timeout: 5_000 })
  }

  async fillBorrowRequestForm(params: {
    startDate: string
    endDate: string
    message?: string
  }): Promise<void> {
    await this.page.fill('[data-testid="start-date-input"]', params.startDate)
    await this.page.fill('[data-testid="end-date-input"]', params.endDate)
    if (params.message) {
      await this.page.fill('[data-testid="borrow-message"]', params.message)
    }
  }

  async submitBorrowRequest(): Promise<void> {
    await this.page.click('[data-testid="request-submit"]')
  }

  async getBorrowRequestSuccess(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[role="status"]', { timeout: 8_000 })
      return true
    } catch {
      return false
    }
  }

  async getRequestCardByToolName(toolName: string): Promise<boolean> {
    const count = await this.page
      .locator(`[data-testid="request-tool-name"]:has-text("${toolName}")`)
      .count()
    return count > 0
  }

  async waitForStatusChange(expectedStatus: string): Promise<void> {
    await this.page
      .locator(`[data-testid="request-card"] .rounded-full:has-text("${expectedStatus}")`)
      .waitFor({ state: 'visible', timeout: 10_000 })
  }
}
