# Phase 31 — Builder v1.5, Forms, and Media Runtime v2

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

Upgrade the builder from a functional MVP to a practical site-building experience. Focus on real form rendering, media selection/resolution, responsive layout controls, reusable sections, and editor ergonomics.

## Scope

Allowed:
- Builder schema extensions.
- Public renderer improvements.
- Editor config improvements.
- Real form renderer.
- Media relation-backed resolution.
- Responsive layout controls.
- Reusable/global sections foundation if safe.
- Tests for schemas/rendering/editor mapping.

Forbidden:
- Full Webflow clone.
- Arbitrary React components.
- Raw HTML/script blocks.
- Marketplace block install.
- Payment features.

## File-by-file TODO

### 1. Split large builder files

Inspect:
- `packages/builder-core/src/blocks/core-blocks.tsx`
- `packages/builder-editor/src/config.tsx`

Tasks:
- Split large file into modules:
  - `packages/builder-core/src/blocks/content-blocks.tsx`
  - `packages/builder-core/src/blocks/form-blocks.tsx`
  - `packages/builder-core/src/blocks/commerce-blocks.tsx`
  - `packages/builder-core/src/blocks/layout-blocks.tsx`
  - `packages/builder-editor/src/config/content.tsx`
  - `packages/builder-editor/src/config/forms.tsx`
  - `packages/builder-editor/src/config/commerce.tsx`
  - `packages/builder-editor/src/config/layout.tsx`
- Preserve public exports.
- No behavior regression.

### 2. Real form renderer

Inspect:
- `packages/builder-core/src/blocks/core-blocks.tsx`
- `apps/web/src/lib/forms/service.ts`
- `apps/web/src/app/api/forms/[formId]/public/route.ts`
- `apps/web/src/app/api/forms/[formId]/submit/route.ts`

Create:
- `apps/web/src/components/forms/public-form.tsx`
- `apps/web/src/components/forms/public-form-client.tsx` if necessary.
- `apps/web/src/lib/forms/rendering.ts`

Tasks:
- Render supported fields:
  - text
  - textarea
  - email
  - checkbox
  - select
  - hidden if allowed
- Fetch safe public form projection server-side where possible.
- Submit to existing API.
- Show validation errors safely.
- Keep workflow config private.
- Add tests.

### 3. Media picker and relation-backed images

Inspect:
- `apps/web/src/collections/Media.ts`
- `apps/web/src/lib/content/rendering.ts`
- `packages/builder-core/src/schema.ts`
- `packages/builder-editor/src/config.tsx`

Tasks:
- Define safe image reference model.
- Resolve media relations server-side for public rendering.
- Add editor media picker placeholder or Payload-backed selector if practical.
- Require alt text.
- Never expose private media.

### 4. Responsive layout controls

Inspect:
- `packages/builder-core/src/types.ts`
- `packages/builder-core/src/schema.ts`
- `packages/builder-core/src/blocks/*`
- `packages/builder-editor/src/config*`

Tasks:
- Add layout props:
  - maxWidth
  - padding
  - gap
  - columns
  - alignment
  - mobile/tablet/desktop variants if plan allows
- Strictly validate values.
- No arbitrary class injection.
- Use tokenized classes only.

### 5. Reusable sections foundation

Optional if plan allows:
- Add `ReusableSection` collection or safe block reference.
- Do not allow recursive loops.
- Draft protection must remain.
- Site-aware behavior must remain.

### 6. Editor UX polish

Tasks:
- Add constrained controls.
- Better empty states.
- Mobile/tablet preview if practical.
- Do not import editor code into public routes.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --dir packages/builder-core test
pnpm --dir packages/builder-editor test
pnpm --dir apps/web test
pnpm --dir apps/web build
```

If Payload collections change:
```bash
pnpm --dir apps/web generate:types
```

## Stop condition

Provide:
- Builder files split.
- Form renderer implemented.
- Media resolution implemented.
- Responsive controls added.
- Editor mappings changed.
- Tests added.
- Known gaps.
