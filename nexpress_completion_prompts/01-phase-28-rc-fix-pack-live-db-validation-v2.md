# Phase 28 — RC Fix Pack and Live DB Validation v2

# Common Context for NexPress / MAG Builder

You are working on a greenfield production project called **MAG Builder / NexPress**.

The project is currently a large Next.js 16 + Payload CMS monorepo that reached a Release Candidate foundation after phases 00-27. A recent project map reported:
- 273 scanned files.
- 28,373 total lines.
- 24,097 code lines.
- 240 scanned directories.
- Largest / most sensitive files include:
  - `apps/web/src/payload-types.ts`
  - `apps/web/src/lib/commerce/service.ts`
  - `apps/web/src/lib/plugins/service.ts`
  - `apps/web/src/lib/templates/service.ts`
  - `packages/builder-editor/src/config.tsx`
  - `packages/commerce/src/medusa.ts`
  - `packages/builder-core/src/blocks/core-blocks.tsx`
  - `packages/api/src/openapi.ts`

Core architecture already exists:
- `apps/web`: Next.js 16 App Router + Payload CMS.
- `packages/builder-core`: public builder schema/rendering.
- `packages/builder-editor`: Puck editor adapter only.
- `packages/themes`, `packages/plugins`, `packages/forms`, `packages/commerce`, `packages/api`, `packages/webhooks`, `packages/mcp-gateway`, `packages/search`, `packages/analytics`, `packages/automation`, `packages/marketplace`, `packages/security`, `packages/observability`.
- Public routes include `/`, `/[slug]`, `/journal/[slug]`, `/login`, `/signup`, `/account`.
- API routes include `/api/health`, `/api/readiness`, `/api/openapi.json`, `/api/search`, `/api/analytics/summary`, `/api/mcp`, `/api/marketplace/*`, `/api/commerce/*`, `/api/forms/*`, `/api/webhooks/inbound`, `/api/plugins/*`, `/api/templates/*`, `/api/members/*`.
- Payload collections include at least `users`, `members`, `sites`, `pages`, `posts`, `media`, `forms`, `form-submissions`, `commerce-customers`, `commerce-orders`, `plugin-states`, `webhook-subscriptions`, `webhook-deliveries`, `integrations`, `audit-logs`, `installation-state`, `redirects`.

Important current gaps inferred from the file map and prior implementation:
- `apps/web/src/migrations/` still contains only `.gitkeep` in the map; live DB migrations must be generated and reviewed.
- `packages/auth`, `packages/cms`, `packages/config`, `packages/db`, `packages/shared`, and `packages/api-contracts` are still placeholder-style packages unless you find they were completed locally.
- Many features are foundations/MVPs:
  - Commerce is not production Shopify/WooCommerce yet.
  - Marketplace is dry-run only.
  - MCP is read-only/safe only.
  - Search is process/local unless a production adapter is added.
  - Analytics is Noop/local unless a production adapter is added.
  - Automation rules are limited/hard-coded unless persistence/UI is added.
  - Form email provider is stubbed unless a provider is added.
  - Rate limiting is in-memory unless a distributed store is added.
  - Admin UX is incomplete for many modules.
  - Builder needs advanced layout/responsive/media/form improvements.

Global rules:
- Work on exactly one prompt/phase at a time.
- Do not implement unrelated features.
- Do not hide known limitations.
- Do not commit secrets.
- Do not use `next lint`; use ESLint CLI scripts already in package.json.
- Keep `env.ts` split-schema behavior. Do not eagerly validate runtime secrets during static build.
- Prefer server-side checks over client-side hiding.
- Keep Payload Local API usage server-only. Use `overrideAccess: false` when the operation should respect access control.
- Do not add dangerous MCP tools.
- Do not enable marketplace runtime install/update execution unless a later prompt explicitly authorizes it.
- Do not add payment handling unless the commerce production prompt explicitly requires a safe provider integration.


## Start instruction

You are continuing after Phase 27. The user may already have started the old Phase 28 prompt. Do not restart blindly. First inspect current working tree and continue from what already exists.

```bash
git status --short
```

If there are existing changes, review them before editing. Do not overwrite user work.

## Goal

Fix release-candidate blockers and validate the project against a live PostgreSQL database. This phase must produce a trustworthy base before any new product features.

## Scope

Allowed:
- Release blocker fixes.
- Docker standalone alignment.
- Next route typegen/typecheck reliability.
- Redirect/origin/CSRF hardening for existing browser POST routes.
- Live DB migration generation and review.
- Documentation updates for exact deployment/migration behavior.
- Minor tests for these fixes.

Forbidden:
- New product features.
- New admin UI modules.
- New commerce payment logic.
- New marketplace execution.
- Dangerous MCP tools.
- Broad refactors unrelated to RC blockers.

## File-by-file TODO

### 1. Repository state and status

Inspect:
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `docs/release/RELEASE_CANDIDATE.md`
- `docs/release/KNOWN_LIMITATIONS.md`
- `docs/product/production-roadmap.md`

Tasks:
- Ensure these reflect that Phase 27 is complete and Phase 28 is active.
- Do not remove known limitations.
- Add Phase 28 review file at `plans/phase-28-rc-fix-pack-live-db-validation/review.md`.

### 2. Docker build correctness

Inspect:
- `apps/web/next.config.ts`
- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`
- `docs/runbooks/deployment.md`
- `docs/architecture/environment-matrix.md`

Tasks:
- If `Dockerfile` copies `/app/apps/web/.next/standalone`, ensure `apps/web/next.config.ts` sets `output: "standalone"`.
- Ensure `Dockerfile` does not copy `.env`.
- Ensure `apps/web/public` exists. If empty, add `apps/web/public/.gitkeep`.
- Ensure media/upload persistence is documented.
- Run if Docker exists:
  - `docker compose config`
  - `docker build -t nexpress-rc-fix-pack .`
- If Docker is unavailable, document as verification gap.

Acceptance:
- Docker config matches actual Next output.
- No secrets are baked into image layers.

### 3. Next typecheck stability

Inspect:
- `apps/web/package.json`
- root `package.json`
- `turbo.json`

Tasks:
- Update `apps/web` typecheck script to generate fresh route types before tsc:
  - `next typegen && tsc --noEmit`
- Make sure this does not break CI.
- Do not commit `.next`.

Acceptance:
- `pnpm --dir apps/web typecheck` works after deleting `.next`.

Commands:
```bash
Remove-Item -Recurse -Force .\apps\web\.next -ErrorAction SilentlyContinue
pnpm --dir apps/web typecheck
pnpm typecheck
```

### 4. Browser POST Origin / CSRF guard

Inspect:
- `apps/web/src/lib/security/browser-post.ts`
- `apps/web/src/lib/security/browser-post.test.ts`

If missing, create:
- `assertSameOriginBrowserPost(request: Request): void`
- `isSameOriginBrowserPost(request: Request): boolean`
- tests for allowed same-origin, missing origin, cross-origin, malformed origin.

Apply to browser/session POST routes:
- `apps/web/src/app/api/members/signup/route.ts`
- `apps/web/src/app/api/members/login/route.ts`
- `apps/web/src/app/api/members/profile/route.ts`
- `apps/web/src/app/api/members/logout/route.ts`
- `apps/web/src/app/api/commerce/cart/route.ts`
- `apps/web/src/app/api/commerce/cart/[cartId]/items/route.ts`
- `apps/web/src/app/api/commerce/cart/[cartId]/checkout/route.ts`
- `apps/web/src/app/api/templates/import/route.ts`
- `apps/web/src/app/api/templates/export/route.ts`
- `apps/web/src/app/api/templates/demo/starter-site/route.ts`
- `apps/web/src/app/api/plugins/*`
- `apps/web/src/app/api/marketplace/plans/route.ts`

Do not apply blindly to public provider webhook endpoints:
- `apps/web/src/app/api/webhooks/inbound/route.ts`
Inbound provider webhooks use signature verification, not browser same-origin CSRF.

Acceptance:
- Browser POST routes reject cross-origin browser form/API calls.
- API clients and provider webhooks are not broken accidentally.

### 5. Redirect and query message safety

Inspect:
- `apps/web/src/app/api/members/signup/route.ts`
- `apps/web/src/app/api/members/login/route.ts`
- `apps/web/src/app/(public)/signup/page.tsx`
- `apps/web/src/app/(public)/login/page.tsx`
- `apps/web/src/app/(public)/account/page.tsx`

Tasks:
- Ensure signup route sanitizes `next` exactly like login route.
- Use allowlisted UI messages for query params.
- Do not render raw query strings as trusted application messages.
- Add tests for `//evil.com`, `https://evil.com`, `/account`, `/some/path`.

Acceptance:
- No open redirect through `next`.
- UI displays safe mapped messages only.

### 6. Payload live DB migration generation

Inspect:
- `apps/web/src/migrations/`
- `apps/web/src/payload.config.ts`
- `apps/web/src/payload-types.ts`
- `docs/runbooks/migrations.md`

Tasks:
- Connect to a real local PostgreSQL database.
- Run:
```bash
pnpm --dir apps/web generate:types
pnpm --dir apps/web migrate:create
pnpm --dir apps/web migrate:status
pnpm --dir apps/web migrate
```
- Review generated migration files.
- Do not manually edit `payload-types.ts`.
- Document any migration generation failure exactly.

Collections expected to be covered:
- users
- members
- sites
- pages
- posts
- media
- forms
- form-submissions
- plugin-states
- commerce-customers
- commerce-orders
- webhook-subscriptions
- webhook-deliveries
- integrations
- redirects
- audit-logs
- installation-state

Acceptance:
- Migration files exist beyond `.gitkeep`, or the review explains exactly why live DB generation could not be completed.
- `migrate:status` is clean after migration.

### 7. Install-from-scratch smoke

With a clean local DB:
- start app
- run install wizard
- create super-admin
- verify `/admin`
- verify `/dashboard`
- verify `/api/health`
- verify `/api/readiness`
- create one page and publish it
- verify `/[slug]`

Document exact result in review.

## Required verification commands

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --dir apps/web generate:types
pnpm --dir apps/web typecheck
pnpm --dir apps/web test
pnpm --dir apps/web build
```

If Docker exists:

```bash
docker compose config
docker build -t nexpress-rc-fix-pack .
```

If live DB exists:

```bash
pnpm --dir apps/web migrate:create
pnpm --dir apps/web migrate:status
pnpm --dir apps/web migrate
```

## Stop condition

Stop after RC blockers and live DB validation. Provide:
- Files changed.
- Docker/standalone status.
- Typecheck/typegen status.
- Browser POST/CSRF routes hardened.
- Redirect/query message fixes.
- Migration files generated or exact blocker.
- Install-from-scratch smoke result.
- Commands run.
- Known gaps.
