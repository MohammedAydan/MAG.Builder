# Master Gap Map and File-by-File TODO

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


## Purpose

This file is the checklist the agent must read before starting any of the detailed prompts. It is not itself an implementation prompt. It exists to prevent agents from missing existing files or duplicating work.

## Current high-risk files to inspect before changes

### Build / Deployment
- `apps/web/next.config.ts`
  - Verify whether `output: "standalone"` exists if Dockerfile expects `.next/standalone`.
  - Confirm security headers still apply.
- `Dockerfile`
  - Verify the standalone output path is correct.
  - Verify it does not copy `.env`.
  - Verify it does not fail if `apps/web/public` is empty/missing.
- `.dockerignore`
  - Ensure `.env`, `.next`, `node_modules`, `.git`, test caches, and local secrets are excluded.
- `docker-compose.yml`
  - Confirm local-only placeholders.
  - Confirm `DATABASE_URL`, `PAYLOAD_SECRET`, media volume behavior, and PostgreSQL healthcheck.
- `.github/workflows/ci.yml`
  - Confirm CI uses placeholder env only.
  - Confirm it runs the same commands documented in release docs.

### Typecheck / Route typegen
- `apps/web/package.json`
  - Ensure `typecheck` runs `next typegen && tsc --noEmit` or equivalent.
- `apps/web/next-env.d.ts`
- `.next` must not be committed.

### Payload / DB
- `apps/web/src/migrations/`
  - If only `.gitkeep` exists, live DB migration generation is still missing.
- `apps/web/src/payload.config.ts`
  - Ensure all collections are registered.
- `apps/web/src/payload-types.ts`
  - Generated file; never manually edit except via `payload generate:types`.
- Collections to verify migration coverage:
  - `Users.ts`
  - `Members.ts`
  - `Sites.ts`
  - `Pages.ts`
  - `Posts.ts`
  - `Media.ts`
  - `Forms.ts`
  - `FormSubmissions.ts`
  - `PluginStates.ts`
  - `CommerceCustomers.ts`
  - `CommerceOrders.ts`
  - `WebhookSubscriptions.ts`
  - `WebhookDeliveries.ts`
  - `Integrations.ts`
  - `Redirects.ts`
  - `AuditLogs.ts`
  - `InstallationState.ts`

### Security / Auth
- `apps/web/src/lib/security/browser-post.ts`
  - Verify it is imported and enforced on browser POST routes.
- `apps/web/src/app/api/members/signup/route.ts`
  - Verify `next` redirect is sanitized.
- `apps/web/src/app/api/members/login/route.ts`
  - Verify redirect sanitization and origin checks.
- `apps/web/src/app/api/members/profile/route.ts`
  - Verify origin checks and safe query messages.
- `apps/web/src/app/(public)/login/page.tsx`
  - Replace raw query messages with allowlisted messages.
- `apps/web/src/app/(public)/account/page.tsx`
  - Replace raw query messages with allowlisted messages.
- `apps/web/src/lib/auth/access.ts`
  - Large file; verify no public role escalation paths.
- `apps/web/src/lib/members/service.ts`
  - Large file; verify role separation and cookie safety.

### Builder / Forms / Media
- `packages/builder-core/src/blocks/core-blocks.tsx`
  - Large file; split if needed.
  - Verify `core.form` renders a real form or hands off to a real renderer.
  - Verify commerce blocks never trust client prices/totals.
- `packages/builder-editor/src/config.tsx`
  - Large file; split into block config modules.
  - Add product/form/media selectors carefully.
- `apps/web/src/components/commerce/storefront-*.tsx`
  - Verify client components only call NexPress APIs.
- `apps/web/src/lib/forms/service.ts`
  - Verify final form renderer integration.
- `packages/forms/src/email.ts`
  - Stub; add production provider in runtime services prompt.

### Commerce
- `apps/web/src/lib/commerce/service.ts`
  - Very large; split into catalog/cart/checkout/customer/order modules.
  - Verify no raw Medusa response leaks.
- `packages/commerce/src/medusa.ts`
  - Very large; split into client/catalog/cart/checkout/customer/order modules.
  - Add real provider integration only in commerce production prompt.
- `apps/web/src/app/api/commerce/**`
  - Verify Origin/CSRF where cookie/session is used.
  - Validate all product/variant/quantity inputs server-side.

### Admin UX
- `apps/web/src/app/dashboard/**`
  - Currently limited. Add module-specific UI gradually.
- Missing or incomplete dashboard surfaces:
  - sites/domains
  - forms/submissions
  - plugins
  - marketplace
  - templates/themes
  - commerce orders/customers
  - search/analytics/automation
  - webhooks/integrations
  - security/readiness

### Runtime services
- `packages/search`
  - In-memory adapter only until production adapter is added.
- `packages/analytics`
  - Noop adapter until production adapter is added.
- `packages/automation`
  - Rule execution foundation; needs persistence/UI/queue integration.
- `packages/forms/src/rate-limit.ts`
  - In-memory only; add Redis/Valkey adapter.
- `packages/forms/src/email.ts`
  - Stub only; add SMTP/Resend provider.
- `apps/web/src/lib/automation/hooks.ts`
  - Verify hooks are actually called by forms/content/commerce events.

### Marketplace / Plugins / Templates
- `packages/marketplace`
  - Dry-run only; keep it safe until explicitly implementing managed execution.
- `packages/plugins`
  - Local allowlisted only.
- `plugins/*`
  - Mostly placeholder packs.
- `templates/blog-site`, `templates/ecommerce-site`
  - Placeholder templates.
- `templates/starter-site/template.manifest.json`
  - Real starter template; expand later.

### Placeholder packages to resolve or document
- `packages/api-contracts`
- `packages/auth`
- `packages/cms`
- `packages/config`
- `packages/db`
- `packages/shared`

## What not to do

- Do not turn marketplace into runtime remote install before security model exists.
- Do not add payments in the same branch as admin UI.
- Do not add dangerous MCP tools.
- Do not run multiple agents against the same shared files.
- Do not manually edit generated `payload-types.ts`.

## Suggested branches

```bash
git checkout -b fix/phase-28-rc-db-validation
git checkout -b feat/phase-29-runtime-services
git checkout -b feat/phase-30-admin-control-center
```
