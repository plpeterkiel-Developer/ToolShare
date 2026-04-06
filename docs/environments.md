# Multi-Environment Setup

ToolShare runs in three environments: **development**, **test**, and **production**.

## Environments Overview

| Aspect                | Development       | Test                                   | Production      |
| --------------------- | ----------------- | -------------------------------------- | --------------- |
| `NEXT_PUBLIC_APP_ENV` | `development`     | `test`                                 | `production`    |
| Purpose               | Local development | Staging / QA                           | Live users      |
| Email                 | Logged to console | Logged to console (unless API key set) | Sent via Resend |
| Sentry sample rate    | 0 (disabled)      | 0.1                                    | 0.2             |
| Logger format         | Pretty-printed    | JSON                                   | JSON            |
| Debug logs            | Shown             | Suppressed                             | Suppressed      |

## Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in the Supabase credentials (local or cloud dev project)
3. `RESEND_API_KEY` is optional — emails are logged to console without it
4. Run `npm run dev`

## Test / Staging Environment

Each environment needs its own instances of:

- **Supabase project** (separate database and auth)
- **Resend API key** (use test key or omit to log emails)
- **Sentry project** (separate error tracking)

### GitHub Environment Setup

1. In your GitHub repository, go to **Settings > Environments**
2. Create a `test` environment
3. Add the following environment variables in the GitHub environment settings: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
4. Optionally add variable `TEST_DEPLOY_URL` for post-deploy health checks

### Deployment

Preview deployments are created automatically by **Vercel's Git integration** on every push to a non-`main` branch — each preview uses the test Supabase project. Pushing to `main` triggers a **production** deployment to tool-share.eu. The GitHub Actions workflow in `.github/workflows/ci.yml` runs lint + tests on each push; Vercel handles the deploys.

## Production Environment

### GitHub Environment Setup

1. Create a `production` environment in **Settings > Environments**
2. Enable **Required reviewers** for manual approval before deploys
3. Add all production secrets (same keys as test, with production values)
4. Optionally add variable `PRODUCTION_DEPLOY_URL` for post-deploy health checks

### Deployment

Production deploys are triggered by:

- Publishing a **GitHub Release**
- Manual trigger via **workflow_dispatch**

See `.github/workflows/deploy-production.yml`.

## Deployment Secrets (Vercel)

Both CI and production deploy workflows use Vercel. Add these secrets in **Settings > Secrets and variables > Actions**:

| Secret                   | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`           | Personal access token from [Vercel dashboard](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`          | Found in `.vercel/project.json` after running `vercel link`                      |
| `VERCEL_PROJECT_ID`      | Found in `.vercel/project.json` after running `vercel link`                      |
| `CRON_SECRET`            | Random secret for authenticating cron job requests                               |
| `RESEND_API_KEY`         | Resend API key (`re_live_…` for production)                                      |
| `EMAIL_FROM`             | Sender address on a Resend-verified domain (e.g. `noreply@tool-share.eu`)        |
| `SEND_EMAIL_HOOK_SECRET` | Supabase Auth Send Email Hook signing secret (`whsec_…`)                         |

To switch from Vercel to another platform (Fly.io, Railway), see the commented alternatives in the workflow files.

## Running BDD Tests

BDD tests use their own config file `.env.test`:

```bash
cp .env.test.example .env.test
# Fill in local Supabase credentials
npm run test:e2e
```

## Email (Resend) Setup

ToolShare sends transactional emails (signup confirmation, magic links, password reset) via [Resend](https://resend.com). Supabase's built-in mailer is **not used** — instead, a custom **Auth Send Email Hook** tells Supabase to call the app's `/api/auth/send-email` endpoint, which sends emails through Resend.

All five steps below must be completed for email to work in production.

### Step 1: Create a Resend account and API key

1. Go to [resend.com](https://resend.com) and create an account
2. Navigate to **API Keys** ([resend.com/api-keys](https://resend.com/api-keys))
3. Click **Create API Key**
   - Name: e.g. `toolshare-production`
   - Permission: **Sending access**
   - Domain: leave as "All domains" (or restrict to your verified domain)
4. Copy the key immediately — it is only shown once

The key format is `re_live_...` for production. Resend also offers `re_test_...` keys for testing, but note that test keys can **only send to the account owner's email address**.

### Step 2: Verify your sender domain in Resend

Resend will reject all emails sent from an unverified domain. You must verify the domain you want to use in `EMAIL_FROM`.

1. Navigate to **Domains** ([resend.com/domains](https://resend.com/domains))
2. Click **Add Domain**
3. Enter your domain: `tool-share.eu`
4. Resend displays DNS records you need to add. There are typically three:

   | Type      | Purpose         | Example name                      | Example value                              |
   | --------- | --------------- | --------------------------------- | ------------------------------------------ |
   | **MX**    | Bounce handling | `feedback.tool-share.eu`          | `feedback-smtp.resend.com` (priority `10`) |
   | **TXT**   | SPF             | `tool-share.eu`                   | `v=spf1 include:resend.com ~all`           |
   | **CNAME** | DKIM            | `resend._domainkey.tool-share.eu` | _(value provided by Resend)_               |

   > The exact record names and values are shown in the Resend dashboard — copy them from there.

5. Add these records in your DNS provider (e.g. Cloudflare, Vercel DNS, Namecheap):
   - Log in to your DNS provider
   - Go to the DNS management page for `tool-share.eu`
   - Add each record exactly as Resend specifies
6. Back in Resend, click **Verify**
   - DNS propagation can take anywhere from a few minutes up to 48 hours
   - Status will change from "Pending" to "Verified" once complete
   - Until verified, all sends from this domain will fail

### Step 3: Set environment variables

Three variables are needed for email to work:

| Variable                 | Example value           | Description                                             |
| ------------------------ | ----------------------- | ------------------------------------------------------- |
| `RESEND_API_KEY`         | `re_live_abc123...`     | API key from Step 1                                     |
| `EMAIL_FROM`             | `noreply@tool-share.eu` | Sender address — domain must be verified in Resend      |
| `SEND_EMAIL_HOOK_SECRET` | `whsec_abc123...`       | Webhook signing secret from Supabase (set up in Step 4) |

These must be set in **two places**:

#### A. Vercel Dashboard (runtime)

These are the values the running app reads at request time.

1. Go to [vercel.com](https://vercel.com) → your ToolShare project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable above for the **Production** environment
4. Click **Save**

> You do **not** need to redeploy after adding Vercel env vars — they take effect on the next function invocation.

#### B. GitHub Secrets (deploy workflow)

The deploy workflow (`.github/workflows/deploy-production.yml`) also needs these values at build time.

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each variable:
   - `RESEND_API_KEY` → paste the API key
   - `EMAIL_FROM` → `noreply@tool-share.eu`
   - `SEND_EMAIL_HOOK_SECRET` → paste the webhook secret (after Step 4)

The app will **refuse to start** in production if `EMAIL_FROM` is missing or uses a `.local` domain.

### Step 4: Configure the Supabase Auth Send Email Hook

This tells Supabase to POST to your app whenever it needs to send an auth email, instead of using its built-in (rate-limited) mailer.

1. Open the [Supabase dashboard](https://supabase.com/dashboard) and select your production project
2. In the left sidebar, click **Authentication**
3. Click the **Hooks** tab at the top
4. Find **Send Email** and click **Enable Hook** (or **Add Hook**)
5. Configure the hook:
   - **Hook type:** HTTP Request
   - **HTTP method:** POST
   - **URL:** `https://tool-share.eu/api/auth/send-email`
6. Under **Signing secret**, Supabase generates a secret in `whsec_...` format
   - **Copy this secret** — you need it for `SEND_EMAIL_HOOK_SECRET`
7. Click **Save**

Now go back and set `SEND_EMAIL_HOOK_SECRET` in both **Vercel** and **GitHub Secrets** (Step 3) using the `whsec_...` value you just copied.

> **How it works:** When a user signs up, Supabase sends a POST request to your URL with the user's email and a confirmation token. The app's webhook handler (`/api/auth/send-email`) verifies the signature using `SEND_EMAIL_HOOK_SECRET`, renders the email template, and sends it via Resend. Supabase includes three headers for signature verification: `webhook-id`, `webhook-timestamp`, and `webhook-signature`.

### Step 5: Deploy and verify

1. Push your changes and trigger a production deploy (via GitHub Release or workflow_dispatch)
2. Once deployed, sign up with a **new email** — use a Gmail `+` alias to avoid creating a real account:
   ```
   plpeterkiel+test2@gmail.com
   ```
3. You should be redirected to the "Confirm your email" page
4. Check your Gmail inbox for a confirmation email from `noreply@tool-share.eu`
5. Click the **Confirm** button in the email — you should be redirected to the app and logged in

### Troubleshooting

| Symptom                      | Likely cause                                                                  | How to check                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| No email arrives at all      | Supabase Send Email Hook not configured or URL is wrong                       | Check Supabase Auth → Hooks → is the hook enabled and pointing to `https://tool-share.eu/api/auth/send-email`? |
| 401 error in logs            | `SEND_EMAIL_HOOK_SECRET` doesn't match the Supabase hook secret               | Compare the `whsec_...` value in Vercel env vars with the one in Supabase Auth → Hooks                         |
| 500 error in logs            | `RESEND_API_KEY` is invalid, or `EMAIL_FROM` domain is not verified in Resend | Check Vercel function logs for `Resend error (signup): ...` — the error message tells you exactly what's wrong |
| Email arrives but link fails | Callback route issue or `NEXT_PUBLIC_SITE_URL` wrong                          | Ensure `NEXT_PUBLIC_SITE_URL` is set to `https://tool-share.eu` in both Vercel and GitHub Secrets              |
| Email lands in spam          | SPF/DKIM DNS records missing or incorrect                                     | Go to Resend → Domains → check that all DNS records show "Verified"                                            |
| App won't start              | `EMAIL_FROM` is missing or set to a `.local` domain                           | Check Vercel build logs for `EMAIL_FROM is set to "..." which uses an unverifiable domain`                     |

## Health Check

All environments expose `GET /api/health`:

```json
{
  "status": "ok",
  "environment": "production",
  "version": "0.1.0",
  "timestamp": "2026-03-29T12:00:00Z",
  "checks": {
    "database": "ok"
  }
}
```

Returns HTTP 200 when healthy, HTTP 503 when degraded (database unreachable).

## CI/CD Flow

```
PR created
  └─> lint + type-check + build + smoke tests + full E2E

PR merged to main
  └─> lint + type-check + build
      └─> auto-deploy to test environment
          └─> health check verification

GitHub Release published (or manual trigger)
  └─> build for production
      └─> deploy to production (requires reviewer approval)
          └─> health check verification
```
