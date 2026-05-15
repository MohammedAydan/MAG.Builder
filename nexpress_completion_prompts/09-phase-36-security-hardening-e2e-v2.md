# Phase 36 — Security Hardening Pass 2 and E2E QA v2

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


## Goal

Add end-to-end validation and harden security boundaries before GA. This is a verification and hardening phase, not a feature phase.

## Scope

Allowed:
- Playwright or minimal E2E framework if not present.
- Security regression tests.
- CSRF/origin regression tests.
- Auth boundary E2E tests.
- Multi-site isolation E2E tests.
- Docker smoke tests.
- CSP tightening if safe.
- Dependency audit triage docs.

Forbidden:
- New product features.
- Payments.
- Marketplace execution.
- Dangerous MCP tools.
- Large UI redesign.

## File-by-file TODO

### 1. E2E test foundation

Create if missing:
- `apps/web/e2e/`
- `apps/web/playwright.config.ts` or repo-level equivalent.

Tests:
- install wizard smoke.
- admin login smoke.
- dashboard access smoke.
- member signup/login/account smoke.
- public page render.
- builder save/preview smoke.
- form submit smoke.
- commerce add-to-cart smoke.
- search smoke.
- API health/readiness/openapi smoke.

No production secrets required.

### 2. Security boundary tests

Add tests for:
- public member cannot access `/admin`.
- public member cannot access `/dashboard`.
- anonymous cannot access account.
- signup cannot assign role.
- draft content not public.
- members-only content not anonymous.
- search excludes private/draft/cross-site.
- analytics summary admin-only.
- MCP requires auth/scopes.
- marketplace dry-run only.
- CSRF origin reject works.
- webhook secrets not exposed.

### 3. CSP and headers

Inspect:
- `packages/security/src/headers.ts`
- `apps/web/next.config.ts`

Tasks:
- Add route-level/staged improvements if safe.
- Do not break Payload Admin/Puck.
- Document remaining `unsafe-inline`/`unsafe-eval` exceptions.

### 4. Docker smoke

Run if Docker available:
```bash
docker compose config
docker build -t nexpress-e2e-check .
```

Optional:
```bash
docker compose up --build
```

Document if Docker unavailable.

## Verification

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If E2E added:
```bash
pnpm --dir apps/web e2e
```

## Stop condition

Provide:
- E2E tests added.
- Security boundaries covered.
- CSP/header changes.
- Docker smoke result.
- Known GA blockers.
