import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber'
import { Browser, BrowserContext, Page, chromium } from '@playwright/test'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config({ path: '.env.local' })

export class CustomWorld extends World {
  browser!: Browser
  context!: BrowserContext
  page!: Page
  supabaseAdmin!: SupabaseClient
  baseUrl: string
  testRunId: string
  currentUserEmail: string = ''
  private seededToolIds: Map<string, string> = new Map()

  constructor(options: IWorldOptions) {
    super(options)
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    this.testRunId = uuidv4()

    this.supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }

  async init(): Promise<void> {
    const headless = process.env.HEADLESS !== 'false'

    this.browser = await chromium.launch({ headless })
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
    })
    this.page = await this.context.newPage()
  }

  async loginAs(email: string, password: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}/da/auth/login`)
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.fill('[data-testid="password-input"]', password)
    await this.page.click('[data-testid="login-submit"]')
    await this.page.waitForURL(/\/da\//, { timeout: 15_000 })
  }

  registerSeededTool(name: string, id: string): void {
    this.seededToolIds.set(name, id)
  }

  getSeededToolId(name: string): string | undefined {
    return this.seededToolIds.get(name)
  }

  async teardown(): Promise<void> {
    await this.context?.close()
    await this.browser?.close()
  }
}

setWorldConstructor(CustomWorld)
