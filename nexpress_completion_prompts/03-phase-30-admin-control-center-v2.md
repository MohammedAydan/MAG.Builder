# Phase 30 — Admin Control Center Completion v2

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

Turn the backend/API-heavy foundation into an actually usable admin product. Build focused dashboard surfaces for the modules that currently exist mostly as services/APIs.

## Scope

Allowed:
- Dashboard UI pages and server actions/route handlers for existing features.
- No new business logic beyond minimal UI service calls.
- Permission-aware navigation.
- Safe admin-only pages for plugins, marketplace, forms, submissions, sites, webhooks, integrations, analytics, search, automation, commerce orders/customers, themes/templates.

Forbidden:
- Payments.
- Marketplace install execution.
- Dangerous MCP tools.
- Large redesign of public site.
- Rewriting Payload admin.

## File-by-file TODO

### 1. Dashboard navigation

Inspect:
- `apps/web/src/lib/dashboard/navigation.ts`
- `apps/web/src/lib/dashboard/access.ts`
- `apps/web/src/app/dashboard/layout.tsx`
- `apps/web/src/app/dashboard/page.tsx`

Tasks:
- Add grouped nav sections:
  - Content
  - Commerce
  - Members/Sites
  - Forms
  - Automation
  - Integrations
  - Marketplace
  - System
- Navigation visibility must be permission-aware but not a security boundary.
- Add tests for nav filtering.

### 2. Sites/Domains UI

Create if missing:
- `apps/web/src/app/dashboard/sites/page.tsx`
- `apps/web/src/app/dashboard/sites/[id]/page.tsx` if needed.

Use:
- `apps/web/src/lib/sites/service.ts`
- `apps/web/src/collections/Sites.ts`

Tasks:
- List sites.
- Show safe site metadata.
- Add placeholder for custom domain verification if not implemented.
- No public member access.

### 3. Forms/Submissions UI

Create:
- `apps/web/src/app/dashboard/forms/page.tsx`
- `apps/web/src/app/dashboard/forms/[id]/page.tsx`
- `apps/web/src/app/dashboard/forms/[id]/submissions/page.tsx`

Use:
- `apps/web/src/lib/forms/service.ts`
- `apps/web/src/collections/Forms.ts`
- `apps/web/src/collections/FormSubmissions.ts`

Tasks:
- List forms.
- View form safe configuration.
- View submissions admin-only with safe redaction.
- No raw webhook secrets.
- No public reads.

### 4. Plugin and Marketplace UI

Create:
- `apps/web/src/app/dashboard/plugins/page.tsx`
- `apps/web/src/app/dashboard/marketplace/page.tsx`

Use:
- `apps/web/src/lib/plugins/service.ts`
- `apps/web/src/lib/marketplace/service.ts`

Tasks:
- List available plugins and states.
- Activate/deactivate only if already supported and safe.
- Show marketplace packages and dry-run plans.
- Do not execute package installation.
- Do not fetch remote marketplace.

### 5. Templates and Themes UI

Create:
- `apps/web/src/app/dashboard/templates/page.tsx`
- `apps/web/src/app/dashboard/themes/page.tsx`

Use:
- `apps/web/src/lib/templates/service.ts`
- `packages/themes`

Tasks:
- List local templates/themes.
- Import/export existing safe flows.
- Add site-wide theme selector only if backed by Site settings and protected.
- Do not allow arbitrary template upload unless validated.

### 6. Commerce admin UI

Create:
- `apps/web/src/app/dashboard/commerce/orders/page.tsx`
- `apps/web/src/app/dashboard/commerce/customers/page.tsx`

Use:
- `apps/web/src/lib/commerce/service.ts`
- `apps/web/src/collections/CommerceOrders.ts`
- `apps/web/src/collections/CommerceCustomers.ts`

Tasks:
- Show order snapshots.
- Show customer mappings.
- No payment actions.
- No refunds.
- No raw Medusa responses.

### 7. Search/Analytics/Automation UI

Create:
- `apps/web/src/app/dashboard/search/page.tsx`
- `apps/web/src/app/dashboard/analytics/page.tsx`
- `apps/web/src/app/dashboard/automation/page.tsx`

Use:
- `apps/web/src/lib/search/service.ts`
- `apps/web/src/lib/analytics/service.ts`
- `apps/web/src/lib/automation/hooks.ts`
- `packages/automation`

Tasks:
- Search status and reindex action if already implemented safely.
- Analytics aggregate summary only.
- Automation rules/status placeholder if rules are still hard-coded.
- No raw event streams publicly.

### 8. Webhooks/Integrations UI

Create:
- `apps/web/src/app/dashboard/integrations/page.tsx`
- `apps/web/src/app/dashboard/webhooks/page.tsx`

Use:
- `apps/web/src/collections/WebhookSubscriptions.ts`
- `apps/web/src/collections/WebhookDeliveries.ts`
- `apps/web/src/collections/Integrations.ts`

Tasks:
- List subscriptions/deliveries safe metadata.
- Never display full secrets.
- Rotate/show-once only if designed; otherwise document future work.

## UI quality requirements

- Server Components by default.
- Small client components only for interactions.
- Reuse existing design tokens and `SurfaceCard`.
- Accessible labels.
- Empty states.
- Permission-aware guards.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --dir apps/web test
pnpm --dir apps/web build
```

## Stop condition

Provide:
- Dashboard pages added.
- Permissions used.
- Admin UX still missing.
- Routes added.
- Tests added.
- Known gaps.
