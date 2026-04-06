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

| Secret              | Description                                                                      |
| ------------------- | -------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Personal access token from [Vercel dashboard](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`     | Found in `.vercel/project.json` after running `vercel link`                      |
| `VERCEL_PROJECT_ID` | Found in `.vercel/project.json` after running `vercel link`                      |
| `CRON_SECRET`       | Random secret for authenticating cron job requests                               |

To switch from Vercel to another platform (Fly.io, Railway), see the commented alternatives in the workflow files.

## Running BDD Tests

BDD tests use their own config file `.env.test`:

```bash
cp .env.test.example .env.test
# Fill in local Supabase credentials
npm run test:e2e
```

## Email (Resend) Setup

ToolShare sends transactional emails (signup confirmation, magic links, password reset) via [Resend](https://resend.com). Supabase's built-in mailer is replaced by a custom **Auth Send Email Hook** that calls the app's `/api/auth/send-email` endpoint.

### 1. Create a Resend account and get an API key

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** in the Resend dashboard
3. Create a new API key (use a `Sending access` key for production)
4. Copy the key — you'll need it for `RESEND_API_KEY`

### 2. Verify your sender domain

1. In the Resend dashboard, go to **Domains** → **Add Domain**
2. Enter the domain you want to send from (e.g. `tool-share.eu`)
3. Resend will show DNS records (MX, TXT/SPF, DKIM) to add to your domain
4. Add these records in your DNS provider (e.g. Cloudflare, Vercel DNS, Route53)
5. Click **Verify** in Resend — this can take a few minutes to propagate
6. Once verified, you can send from any address on that domain (e.g. `noreply@tool-share.eu`)

### 3. Set environment variables

Add these to your hosting platform (e.g. Vercel Environment Variables):

| Variable         | Example                 | Description                            |
| ---------------- | ----------------------- | -------------------------------------- |
| `RESEND_API_KEY` | `re_live_abc123...`     | Your Resend API key                    |
| `EMAIL_FROM`     | `noreply@tool-share.eu` | Must be on a verified domain in Resend |

The app will **refuse to start** in production if `EMAIL_FROM` is missing or uses an unverified `.local` domain.

### 4. Configure Supabase Auth Send Email Hook

This tells Supabase to call your app instead of using its built-in mailer:

1. Go to your Supabase project dashboard → **Authentication** → **Hooks**
2. Enable the **Send Email** hook
3. Set the hook type to **HTTP Request**
4. Set the URL to: `https://your-production-domain.com/api/auth/send-email`
5. Generate a webhook signing secret (Supabase will provide one in `whsec_...` format)
6. Copy the secret and set it as `SEND_EMAIL_HOOK_SECRET` in your hosting platform
7. Save the hook configuration

| Variable                 | Example           | Description                                       |
| ------------------------ | ----------------- | ------------------------------------------------- |
| `SEND_EMAIL_HOOK_SECRET` | `whsec_abc123...` | Must match the secret in the Supabase hook config |

### 5. Verify it works

1. Deploy the app with the new environment variables
2. Sign up with a new email address (e.g. a `+` alias like `you+test@gmail.com`)
3. Check your inbox for the confirmation email from `EMAIL_FROM`
4. Click the confirmation link — you should be redirected to the app and logged in

If no email arrives, check the server logs for `Resend error` or `Send email hook failed` messages.

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
