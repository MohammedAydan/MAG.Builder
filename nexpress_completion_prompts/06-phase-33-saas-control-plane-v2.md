# Phase 33 — SaaS Control Plane v2

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

Turn multi-site readiness into a usable SaaS control plane: site management, domain management, tenant admins/owners, invitations, and site-scoped settings. No billing yet unless explicitly scoped as placeholders.

## Scope

Allowed:
- Site management dashboard.
- Domain mapping and verification placeholder.
- Site-scoped roles or membership model.
- Invitations foundation.
- Site-scoped plugin/theme/template settings.
- Tenant isolation tests.

Forbidden:
- Paid plans/billing.
- Stripe subscriptions.
- Enterprise SSO.
- Automatic DNS provisioning.
- Multi-region infrastructure.

## File-by-file TODO

### 1. Sites collection and service

Inspect:
- `apps/web/src/collections/Sites.ts`
- `apps/web/src/lib/sites/service.ts`
- `apps/web/src/lib/sites/model.ts`
- `apps/web/src/lib/sites/fields.ts`

Tasks:
- Add safe create/update/delete flow for super-admin/site-owner if plan allows.
- Domain verification status fields if needed.
- Default site behavior stays safe.
- No localhost/private domains except documented dev mode.

### 2. Dashboard site UI

Create/update:
- `apps/web/src/app/dashboard/sites/page.tsx`
- `apps/web/src/app/dashboard/sites/[siteId]/page.tsx`
- `apps/web/src/app/dashboard/sites/[siteId]/domains/page.tsx`
- `apps/web/src/app/dashboard/sites/[siteId]/settings/page.tsx`

Tasks:
- List sites.
- Edit safe site metadata.
- Manage domain mappings.
- Show verification placeholder.
- Site-aware permissions.

### 3. Tenant roles and invitations

Create if required:
- `apps/web/src/collections/SiteMemberships.ts`
- `apps/web/src/collections/SiteInvitations.ts`
- `apps/web/src/lib/sites/memberships.ts`
- `apps/web/src/lib/sites/invitations.ts`

Tasks:
- Site owner/admin/editor roles.
- Public members do not become dashboard admins automatically.
- Invitations use email but no provider secrets.
- Tokens must be hashed if persisted.

### 4. Site-scoped settings

Tasks:
- Theme selection per site.
- Plugin activation global vs site-scoped decision.
- Template import target site.
- Search/analytics aggregation per site.

### 5. Cross-tenant tests

Add tests:
- site A cannot read site B content.
- site A search excludes site B.
- site A analytics excludes site B.
- site admin cannot manage global settings unless allowed.
- public member cannot access site admin.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --dir apps/web generate:types
pnpm --dir apps/web test
```

## Stop condition

Provide:
- Site control plane pages.
- Collections added.
- Tenant role model.
- Domain verification model.
- Site-scoped settings behavior.
- Tests.
- Known SaaS gaps.
