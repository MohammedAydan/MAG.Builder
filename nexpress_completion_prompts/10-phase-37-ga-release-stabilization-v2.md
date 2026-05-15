# Phase 37 — GA Release Stabilization v2

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

Prepare the first true General Availability release. This phase should not add features. It should confirm that all blockers are resolved or explicitly accepted.

## Scope

Allowed:
- Final release docs.
- Final changelog.
- Final versioning/tag checklist.
- Final smoke reports.
- Final blocker classification.
- Tiny fixes only.

Forbidden:
- New features.
- New architecture.
- Payment implementation.
- Marketplace execution.
- Dangerous MCP tools.

## File-by-file TODO

### 1. Release docs

Inspect/update:
- `docs/release/RELEASE_CANDIDATE.md`
- `docs/release/CHANGELOG.md`
- `docs/release/GO_NO_GO_CHECKLIST.md`
- `docs/release/KNOWN_LIMITATIONS.md`
- `docs/release/SMOKE_TEST_MATRIX.md`
- `docs/product/production-roadmap.md`

Tasks:
- Rename or add GA docs only if criteria are met.
- Do not claim GA if migrations/Docker/E2E are not validated.
- List accepted limitations clearly.

### 2. Status files

Update:
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `plans/phase-37-ga-release-stabilization/review.md`

Tasks:
- Record exact verification results.
- Record exact remaining limitations.
- Mark GA only if all required checks pass.

### 3. Final verification

Required:
```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --dir apps/web generate:types
```

If Docker:
```bash
docker compose config
docker build -t nexpress-ga-check .
```

If live DB:
```bash
pnpm --dir apps/web migrate:status
pnpm --dir apps/web migrate
```

If E2E:
```bash
pnpm --dir apps/web e2e
```

### 4. Final gate

Do not declare GA if any of these are unverified:
- Docker build.
- Live DB migrations.
- Install-from-scratch.
- Backup/restore.
- Auth/admin/member boundary.
- Public/draft/member-only content boundaries.
- CSRF/origin.
- Commerce safe-state.
- Search/private content isolation.
- MCP safe tools only.
- Marketplace dry-run only.

## Stop condition

Provide:
- GA or No-Go decision.
- Final blockers.
- Verification matrix.
- Release tag recommendation.
- Known limitations.
