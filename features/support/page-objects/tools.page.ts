import type { Page } from '@playwright/test'

export class ToolsPage {
  constructor(
    private page: Page,
    private baseUrl: string
  ) {}

  async navigateToList(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/da/tools`)
  }

  async navigateToNew(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/da/tools/new`)
  }

  async navigateToDetail(toolId: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}/da/tools/${toolId}`)
  }

  async navigateToEdit(toolId: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}/da/tools/${toolId}/edit`)
  }

  // ─── Listing page ─────────────────────────────────────────────────────────

  async getToolCards(): Promise<string[]> {
    await this.page
      .waitForSelector('[data-testid="tool-card"]', { timeout: 10_000 })
      .catch(() => {})
    return this.page.locator('[data-testid="tool-card"]').allTextContents()
  }

  async getToolCardCount(): Promise<number> {
    return this.page.locator('[data-testid="tool-card"]').count()
  }

  async getToolNames(): Promise<string[]> {
    const names = await this.page.locator('[data-testid="tool-name"]').allTextContents()
    return names.map((n) => n.trim())
  }

  async toolIsVisible(name: string): Promise<boolean> {
    const count = await this.page.locator(`[data-testid="tool-name"]:has-text("${name}")`).count()
    return count > 0
  }

  // ─── Form ──────────────────────────────────────────────────────────────────

  async fillToolForm(params: {
    name?: string
    description?: string
    category?: string
    condition?: string
    availability?: string
  }): Promise<void> {
    if (params.name !== undefined) {
      await this.page.fill('[data-testid="tool-name"]', params.name)
    }
    if (params.description !== undefined) {
      await this.page.fill('[data-testid="tool-description"]', params.description)
    }
    if (params.category !== undefined) {
      await this.page.selectOption('[data-testid="tool-category"]', { label: params.category })
    }
    if (params.condition !== undefined) {
      await this.page.selectOption('[data-testid="tool-condition"]', { label: params.condition })
    }
    if (params.availability !== undefined) {
      await this.page.selectOption('[data-testid="availability-toggle"]', {
        label: params.availability,
      })
    }
  }

  async clearToolNameField(): Promise<void> {
    await this.page.fill('[data-testid="tool-name"]', '')
  }

  async submitToolForm(): Promise<void> {
    await this.page.click('[data-testid="tool-form-submit"]')
  }

  // ─── Detail page ──────────────────────────────────────────────────────────

  async getToolDetailName(): Promise<string | null> {
    const el = this.page.locator('[data-testid="tool-detail-name"]')
    if (await el.isVisible()) return el.textContent()
    return null
  }

  async getToolDetailCategory(): Promise<string | null> {
    const el = this.page.locator('[data-testid="tool-detail-category"]')
    if (await el.isVisible()) return el.textContent()
    return null
  }

  async isEditButtonVisible(): Promise<boolean> {
    return this.page.locator('[data-testid="edit-tool-link"]').isVisible()
  }

  async isDeleteButtonVisible(): Promise<boolean> {
    return this.page.locator('[data-testid="delete-tool-button"]').isVisible()
  }

  async isBorrowButtonVisible(): Promise<boolean> {
    return this.page.locator('[data-testid="request-to-borrow-button"]').isVisible()
  }

  async clickEditButton(): Promise<void> {
    await this.page.click('[data-testid="edit-tool-link"]')
  }

  async clickDeleteButton(): Promise<void> {
    await this.page.click('[data-testid="delete-tool-button"]')
  }

  async confirmDeletion(): Promise<void> {
    await this.page.click('[data-testid="confirm-delete-button"]')
  }

  async getDeleteErrorMessage(): Promise<string | null> {
    const el = this.page.locator('[data-testid="delete-tool-error"]')
    try {
      await el.waitFor({ state: 'visible', timeout: 5_000 })
      return el.textContent()
    } catch {
      return null
    }
  }

  async getAvailabilityBadge(): Promise<string | null> {
    const badge = this.page.locator('[data-testid="availability-badge"]').first()
    if (await badge.isVisible()) return badge.textContent()
    // Fallback: find any badge on the detail page
    const anyBadge = this.page.locator('[data-testid="tool-detail-name"] ~ * .rounded-full').first()
    if (await anyBadge.isVisible()) return anyBadge.textContent()
    return null
  }

  async getFormError(): Promise<string | null> {
    const el = this.page.locator('[data-testid="tool-form-error"]')
    if (await el.isVisible()) return el.textContent()
    return null
  }
}
