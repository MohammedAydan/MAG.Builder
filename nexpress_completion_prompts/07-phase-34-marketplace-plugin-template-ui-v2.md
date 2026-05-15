# Phase 34 — Marketplace, Plugin, Template, and Theme Management UI v2

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

Add a safe admin management experience for packages, plugins, templates, and themes while preserving the dry-run/no-runtime-install security model.

## Scope

Allowed:
- Dashboard UI for marketplace catalog and dry-run plans.
- Plugin activation/deactivation UI using existing safe APIs.
- Template import/export UI.
- Theme selector UI.
- Package compatibility display.
- Audit-safe admin actions.

Forbidden:
- Remote install.
- Package manager execution.
- Runtime code loading.
- Executable plugin install.
- Marketplace payments/vendor accounts.

## File-by-file TODO

### 1. Marketplace UI

Inspect:
- `packages/marketplace/src/*`
- `apps/web/src/lib/marketplace/service.ts`
- `apps/web/src/app/api/marketplace/packages/route.ts`
- `apps/web/src/app/api/marketplace/plans/route.ts`

Create/update:
- `apps/web/src/app/dashboard/marketplace/page.tsx`
- `apps/web/src/app/dashboard/marketplace/[packageId]/page.tsx`

Tasks:
- List catalog packages.
- Show compatibility/integrity status.
- Generate dry-run plan.
- Never execute install/update.

### 2. Plugins UI

Inspect:
- `packages/plugins/src/*`
- `apps/web/src/lib/plugins/service.ts`
- `apps/web/src/app/api/plugins/*`

Create/update:
- `apps/web/src/app/dashboard/plugins/page.tsx`
- `apps/web/src/app/dashboard/plugins/[pluginId]/page.tsx`

Tasks:
- List available plugins.
- Show active/disabled state.
- Activate/deactivate via existing server APIs.
- Show migration plan/run only if safe and permissioned.
- Do not load plugin code dynamically.

### 3. Templates UI

Inspect:
- `packages/themes/src/template-manifest.ts`
- `apps/web/src/lib/templates/service.ts`
- `apps/web/src/app/api/templates/*`
- `templates/starter-site/template.manifest.json`

Create/update:
- `apps/web/src/app/dashboard/templates/page.tsx`

Tasks:
- List local templates.
- Import starter site into selected site.
- Export site/pages safely.
- No draft export except super-admin if already supported.
- Validate builder blocks.

### 4. Themes UI

Inspect:
- `packages/themes/src/registry.ts`
- `apps/web/src/lib/design-system/tokens.ts`
- `apps/web/src/collections/Sites.ts`

Create/update:
- `apps/web/src/app/dashboard/themes/page.tsx`

Tasks:
- List available token-based themes.
- Apply theme per site if Site settings support it.
- No executable theme code.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --dir packages/marketplace test
pnpm --dir packages/plugins test
pnpm --dir packages/themes test
pnpm --dir apps/web test
```

## Stop condition

Provide:
- UI pages added.
- API/service usage.
- Security boundaries.
- What remains dry-run.
- Known marketplace/plugin gaps.
