import type { Page } from '@playwright/test'

export class AuthPage {
  constructor(
    private page: Page,
    private baseUrl: string
  ) {}

  async navigateToLogin(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/da/auth/login`)
  }

  async navigateToSignup(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/da/auth/signup`)
  }

  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.fill('[data-testid="password-input"]', password)
  }

  async submitLoginForm(): Promise<void> {
    await this.page.click('[data-testid="login-submit"]')
  }

  async login(email: string, password: string): Promise<void> {
    await this.navigateToLogin()
    await this.fillLoginForm(email, password)
    await this.submitLoginForm()
    await this.page.waitForURL(/\/da\//, { timeout: 15_000 })
  }

  async fillSignupForm(params: {
    displayName: string
    email: string
    password: string
    location?: string
  }): Promise<void> {
    await this.page.fill('[data-testid="display-name-input"]', params.displayName)
    await this.page.fill('[data-testid="email-input"]', params.email)
    await this.page.fill('[data-testid="password-input"]', params.password)
    await this.page.fill('[data-testid="confirm-password-input"]', params.password)
    if (params.location) {
      await this.page.fill('[data-testid="location-input"]', params.location)
    }
  }

  async submitSignupForm(): Promise<void> {
    await this.page.click('[data-testid="register-submit"]')
  }

  async clickLogout(): Promise<void> {
    // Open mobile/desktop menu if needed
    const logoutBtn = this.page.locator('[data-testid="logout-button"]')
    const mobileMenuBtn = this.page.locator('[data-testid="sidebar-toggle"]')

    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click()
    }
    await logoutBtn.click()
  }

  async getErrorMessage(): Promise<string | null> {
    const el = this.page.locator('[data-testid="error-message"]')
    if (await el.isVisible()) return el.textContent()
    return null
  }

  async isLoggedIn(): Promise<boolean> {
    // Check for a link that only appears when authenticated
    const profileLink = this.page.locator('[data-testid="nav-profile-name"]')
    return profileLink.isVisible()
  }

  async getNavDisplayName(): Promise<string | null> {
    const el = this.page.locator('[data-testid="nav-profile-name"]')
    if (await el.isVisible()) return el.textContent()
    return null
  }

  isOnLoginPage(): Promise<boolean> {
    return this.page.locator('[data-testid="login-submit"]').isVisible()
  }
}
