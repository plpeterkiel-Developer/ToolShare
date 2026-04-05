# ToolShare

A community-based tool-sharing platform for neighbourhoods. Users list garden and household tools they own, browse what their neighbours have, and borrow items for free.

Live at **[tool-share.eu](https://tool-share.eu)**.

## Tech stack

- **Next.js 16** (App Router, React Server Components)
- **TypeScript** with strict types
- **Supabase** (Postgres, Auth, Storage, RLS)
- **next-intl** for English + Danish locales
- **Tailwind CSS** for styling
- **Resend** + React Email for transactional mail
- **Sentry** for error tracking
- **Cucumber + Playwright** for BDD/e2e tests
- **Vercel** for hosting (Fluid Compute)

## Features

- Tool listings with search, category filters, and geographic radius search
- Borrow-request workflow: request → owner approves/denies → return
- Community-based access: tools can be public or restricted to a community; users join via approved request
- Two-tier admin: **super admin** manages the platform, **community admin** manages one or more communities
- User ratings, moderation reports, GDPR data export + erasure, admin analytics

## Getting started

```bash
# 1. Clone + install
git clone https://github.com/plpeterkiel-developer/toolshare.git
cd toolshare
npm install

# 2. Configure env (see docs/environments.md)
cp .env.example .env.local
# Fill in Supabase + optional Resend/Sentry keys

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                   | What it does                                    |
| ------------------------- | ----------------------------------------------- |
| `npm run dev`             | Start dev server with Turbopack                 |
| `npm run build`           | Production build                                |
| `npm start`               | Start production server                         |
| `npm run lint`            | ESLint + Next.js rules                          |
| `npm run test:e2e`        | Run Cucumber BDD scenarios against a dev server |
| `npm run test:e2e:headed` | Same, with visible Playwright browser           |

## Database

Migrations live in `supabase/migrations/`. Apply them to a linked Supabase project:

```bash
SUPABASE_ACCESS_TOKEN=<sbp_...> npx supabase db push
```

Separate Supabase projects are used for production and test (see `docs/environments.md`).

## Documentation

- [`docs/environments.md`](docs/environments.md) — environment config, deployment, CI
- [`docs/communities.md`](docs/communities.md) — community onboarding, join/creation requests, admin hierarchy
- BDD feature specs in `features/**/*.feature`

## Contributing

Opens PRs into `main` via feature branches. Vercel creates a preview deployment for every branch. All preview deploys use the **test** Supabase project; production uses a separate one.
