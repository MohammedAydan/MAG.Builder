You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 16 only.

Current completed state:
- Phase 00 completed the monorepo/bootstrap scaffold.
- Phase 01 completed product governance, v1 scope freeze, and architecture constraints.
- Phase 02 completed the Next.js 16 platform foundation.
- Phase 03 completed the Payload CMS foundation.
- Phase 04 completed database, migrations, and seed foundation.
- Phase 05 completed install wizard and runtime config foundation.
- Phase 06 completed identity, RBAC, and audit.
- Phase 07 completed the project-owned admin dashboard shell.
- Phase 08 completed design system and public shell.
- Phase 09 completed content, media, and SEO foundation.
- Phase 10 completed the builder kernel.
- Phase 11 completed the visual editor adapter.
- Phase 12 completed themes and templates.
- Phase 13 completed plugin and module system.
- Phase 14 completed forms and workflows.
- Phase 15 completed public membership and protected routes.

Current technical state:
- apps/web is a real Next.js 16 App Router app.
- Public route / renders through apps/web/src/app/(public)/page.tsx.
- Dynamic public page route exists at apps/web/src/app/(public)/[slug]/page.tsx.
- Dynamic public post route exists at apps/web/src/app/(public)/journal/[slug]/page.tsx.
- Public auth/member routes exist, including login/signup/logout/account routes as implemented in Phase 15.
- Published content can be gated for public vs members-only access.
- Admin/dashboard users stay isolated in users.
- Public members live in a separate members auth boundary.
- Public sign-up cannot assign roles or reach /admin or /dashboard.
- robots.txt and sitemap.xml routes exist.
- Payload is installed and integrated inside apps/web.
- Payload admin route exists at /admin/[[...segments]].
- Payload API route exists at /api/[...slug].
- Health route exists at /api/health.
- Install route exists at /install.
- Install API exists at /api/install.
- Project-owned dashboard route exists at /dashboard.
- Dashboard settings route exists at /dashboard/settings.
- Dashboard pages list exists at /dashboard/pages.
- Visual builder route exists at /dashboard/pages/[id]/builder.
- Builder save route exists at /dashboard/pages/[id]/builder/save.
- Draft preview route exists at /dashboard/pages/[id]/preview.
- Dashboard/editor access is protected server-side.
- typed env validation exists at apps/web/src/lib/env.ts.
- env.ts uses a split-schema pattern:
  - buildEnv validates only build-safe variables at module load.
  - getRuntimeEnv() lazily validates runtime secrets inside handlers/scripts.
  - env Proxy preserves backwards-compatible access.
- Roles implemented:
  - super-admin
  - admin
  - editor
- Public members are separate from admin roles.
- Permission helpers exist under apps/web/src/lib/auth.
- Member helpers/services exist under apps/web/src/lib/members.
- Dashboard helpers exist under apps/web/src/lib/dashboard.
- Audit helpers exist under apps/web/src/lib/audit.
- Content helpers exist under apps/web/src/lib/content.
- Template helpers exist under apps/web/src/lib/templates.
- Plugin helpers/services exist under apps/web/src/lib/plugins.
- Forms helpers/services exist under apps/web/src/lib/forms.
- Design tokens exist under apps/web/src/lib/design-system/tokens.ts.
- Public shell components exist under apps/web/src/components/public.
- Payload collections currently include:
  - users
  - members
  - installation-state
  - audit-logs
  - media
  - pages
  - posts
  - redirects
  - plugin-states
  - forms
  - form-submissions
- pages and posts use Payload drafts via _status.
- Anonymous/public reads only resolve _status = published and only if the content is allowed for the current viewer.
- Public content queries use overrideAccess: false where access control must be respected.
- Media is public-read by design for public-safe assets.
- Alt text is required on media.
- SEO fields exist.
- Payload types exist at apps/web/src/payload-types.ts.
- Builder kernel exists in packages/builder-core.
- apps/web depends on @nexpress/builder-core.
- @nexpress/builder-core owns:
  - versioned builder schema
  - runtime validation
  - deterministic migration helper
  - centralized block registry
  - safe server renderer
  - core.section
  - core.heading
  - core.text
  - core.image
  - core.button
  - core.form
- packages/builder-editor exists.
- apps/web depends on @nexpress/builder-editor.
- @nexpress/builder-editor integrates @measured/puck@0.20.2 as editor-only adapter.
- Puck is not the public renderer.
- Public pages still render through @nexpress/builder-core.
- packages/themes exists.
- apps/web depends on @nexpress/themes.
- packages/plugins exists.
- apps/web depends on @nexpress/plugins.
- @nexpress/plugins owns:
  - versioned plugin manifest schema
  - unsafe-manifest rejection
  - typed capabilities
  - deterministic local registry
  - dependency/conflict validation
  - optional module resolution
  - migration planning metadata
- Local allowlisted plugin definitions include:
  - blog-pack
  - commerce-pack
  - forms-pack
  - membership-pack
  - seo-pack
- These local plugin definitions are metadata-only unless implemented by later phases.
- Hidden protected plugin-states persistence exists in Payload.
- packages/forms exists.
- apps/web depends on @nexpress/forms.
- @nexpress/forms owns:
  - typed form schemas
  - field validation
  - submission validation
  - sanitization
  - SSRF-protected webhook foundation
  - email provider stub
  - in-memory rate limiter
  - typed workflow engine
- Forms collection exists.
- FormSubmissions collection exists.
- Public form APIs exist.
- Current known gaps:
  - no live DB migration files for recent Payload collection additions because migration generation requires a live database.
  - no client-side form rendering component yet.
  - email actions are stubs.
  - rate limiter is in-memory only; Redis/distributed rate limiting is needed for multi-process production.
  - no dedicated dashboard UI for plugin management.
  - no persisted site-wide theme selector yet.
  - no publish workflow UI.
  - no revision history/collaboration.
  - no relation-backed builder media resolution yet.
  - Puck 0.20.2 is upstream-deprecated / behind latest, but the builder kernel remains vendor-neutral.
  - audit is fail-open and not transactional.
  - install flow has two sequential writes without a DB transaction.
  - no live-DB integration test for install/auth/audit/membership yet.
  - dashboard protection is helper-test level rather than full e2e route tests.
  - no interactive mobile dashboard sidebar.
  - protected/private media is out of scope.
- No MCP, Medusa, storefront commerce, checkout, orders, carts, coupons, shipping, taxes, inventory, or real commerce runtime logic has been added yet.

Before doing anything, read:
- AGENTS.md or the correct tool-specific instruction file for your tool
- PLAN.md
- IMPLEMENTATION_STATUS.md
- 01-final-decision-record.md
- docs/product/v1-scope.md
- docs/decisions/README.md
- docs/decisions/0002-v1-product-scope-freeze.md
- docs/decisions/0003-v1-architecture-constraints.md
- docs/runbooks/migrations.md
- docs/runbooks/installation.md
- docs/runbooks/identity-rbac-audit.md
- docs/runbooks/themes-templates.md
- docs/runbooks/plugins-modules.md
- docs/runbooks/forms-workflows.md
- docs/runbooks/membership-protected-routes.md
- 03-phases/README.md
- 03-phases/phase-16-commerce-service-spike/plan.md
- 03-phases/phase-16-commerce-service-spike/tasks.md
- 03-phases/phase-16-commerce-service-spike/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-15-membership-public-protection/review.md

Goal:
Complete Phase 16 — Commerce Service Spike only.

High-level purpose:
Perform a production-minded commerce service spike for MAG Builder / NexPress. This phase should establish the commerce integration direction, service boundary, adapter contracts, safe configuration, capability gates, and minimal smoke-tested connectivity/stubs. It must not implement the full Commerce MVP, storefront commerce blocks, checkout, payments, orders, inventory, shipping, taxes, coupons, or real payment flows.

Implementation requirements:
1. Implement the Commerce Service Spike according to the Phase 16 plan.
2. Confirm and document the selected commerce architecture.
3. Add a commerce service boundary package or app module if required by the plan.
4. Add typed commerce adapter interfaces for products, prices, carts, customers, and orders only as spike contracts.
5. Add Medusa adapter skeleton only if Phase 16 requires Medusa as the selected provider.
6. Add mock/in-memory adapter for tests if useful.
7. Add commerce runtime configuration validation without breaking static builds.
8. Keep commerce secrets runtime-only and server-only.
9. Add safe env placeholders to .env.example only if required.
10. Add health/smoke check functions for commerce provider connectivity only if required.
11. Add commerce capability checks connected to commerce-pack only if required by the plan.
12. Add documentation/runbook for commerce service setup, limitations, and next phase handoff.
13. Add tests for adapter contracts, configuration validation, fail-closed capability checks, and unsafe config rejection.
14. Update IMPLEMENTATION_STATUS.md.
15. Update plans/context.md.
16. Update plans/SESSION_LOG.md.
17. Create or update plans/phase-16-commerce-service-spike/review.md.

Commerce architecture requirements:
1. Define a clear boundary between NexPress CMS/member/content system and commerce provider.
2. Do not put commerce provider SDK calls directly into public components.
3. Do not leak provider secrets to the browser.
4. Do not couple public routes directly to Medusa internals.
5. Use adapter interfaces so provider replacement remains possible.
6. Document what is owned by NexPress and what is owned by the commerce provider.
7. Document identity mapping between NexPress members and commerce customers as a spike decision, but do not implement full sync unless Phase 16 explicitly requires it.
8. Document product/content relationship strategy, but do not implement full product CMS unless Phase 16 explicitly requires it.
9. Document checkout ownership strategy, but do not implement checkout yet.
10. Document order ownership strategy, but do not implement order management yet.

Medusa-specific requirements, if Medusa is used:
1. Add Medusa integration only as a service adapter skeleton/spike.
2. Do not scaffold a separate full Medusa backend inside this repo unless the Phase 16 plan explicitly requires it.
3. Do not copy an entire Medusa starter storefront into the project.
4. Do not implement a full product listing/storefront yet.
5. Do not implement checkout, payment providers, shipping, taxes, promotions, carts, or inventory.
6. Do not expose Medusa admin or secret tokens to the client.
7. If using Medusa JS SDK or API client, keep it server-side unless the plan explicitly approves safe public Store API usage.
8. Validate MEDUSA_BACKEND_URL and any publishable/server keys safely.
9. Keep server keys out of NEXT_PUBLIC variables.
10. Add only minimal smoke/contract tests required for the spike.

Configuration requirements:
1. Keep env.ts split-schema pattern intact.
2. Do not eagerly validate MEDUSA_* or commerce secrets during static build.
3. Runtime commerce config must be validated lazily inside server-only commerce functions.
4. .env.example must include placeholders only, never real secrets.
5. Do not add weak fallback secrets.
6. Invalid commerce config should fail safely with clear server-side errors.
7. Public UI must not expose raw commerce config.
8. Commerce configuration should be documented in a runbook.

Plugin/capability integration:
1. If commerce features are gated by commerce-pack, check capability state server-side.
2. Capability checks must fail closed if commerce-pack is disabled.
3. Do not execute plugin code from manifests.
4. Do not implement full plugin runtime execution.
5. Do not add marketplace or remote plugins.
6. Document whether commerce service is core or requires commerce-pack activation.
7. Do not enable storefront UI automatically unless Phase 16 explicitly requires it.

Membership integration:
1. Do not merge public members with commerce customers yet unless the Phase 16 plan explicitly requires it.
2. If mapping is added, make it explicit and minimal.
3. Do not expose member PII to commerce services unnecessarily.
4. Do not create orders/carts under the wrong identity.
5. Document future customer sync strategy.
6. Keep public membership protections from Phase 15 intact.

Payload/content integration:
1. Do not add product/order/cart collections unless Phase 16 explicitly requires spike metadata only.
2. Do not create public write access for commerce data.
3. Do not expose users, members, audit logs, installation-state, plugin-states, form-submissions, admin data, or system collections.
4. If any commerce settings collection is added, hide and protect it.
5. Generate/update Payload types if collections are changed.
6. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Security requirements:
1. No commerce secrets in client components.
2. No provider secret keys in NEXT_PUBLIC variables.
3. No raw runtime config exposed to public UI.
4. No payment processing in Phase 16.
5. No checkout in Phase 16.
6. No card data, PCI-sensitive data, or payment tokens in Phase 16.
7. No order creation in Phase 16 unless the Phase 16 plan explicitly requires a mock-only contract test.
8. No arbitrary external HTTP calls from public client components.
9. Server-side provider calls must have timeouts and safe error handling if implemented.
10. Do not log provider secrets, tokens, member PII, or raw external responses.
11. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin/forms/membership protections.
12. Client-side hiding is not a security boundary.
13. Public bundle should not include commerce admin/provider-secret code.
14. Be mindful of supply-chain risk; do not add unnecessary packages.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers only if a server endpoint is required for the spike.
- Route Handlers must live inside the app directory.
- Keep Server Components as default.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime commerce secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, or /api/forms/[formId]/submit.

Out of scope:
- Do not implement Commerce MVP yet.
- Do not implement Medusa backend deployment.
- Do not scaffold a full Medusa app unless Phase 16 explicitly requires it.
- Do not implement storefront product pages.
- Do not implement product search/listing UI.
- Do not implement product detail pages.
- Do not implement carts.
- Do not implement checkout.
- Do not implement payments.
- Do not implement payment provider integrations.
- Do not implement orders.
- Do not implement shipping.
- Do not implement taxes.
- Do not implement coupons/promotions.
- Do not implement inventory.
- Do not implement refunds.
- Do not implement webhooks beyond spike-safe placeholders.
- Do not implement MCP.
- Do not implement CRM/newsletter features.
- Do not implement advanced customer accounts.
- Do not start Phase 17.

Acceptance criteria:
- Commerce service boundary exists.
- Commerce adapter contracts exist.
- Selected commerce provider strategy is documented.
- Medusa adapter skeleton exists if required by the plan.
- Commerce runtime config is validated lazily and server-only.
- Commerce secrets are not exposed to the client.
- commerce-pack capability gating exists if required.
- Fail-closed behavior exists when commerce is disabled/misconfigured.
- Tests cover adapter contracts, config validation, capability gating, and unsafe config rejection.
- No checkout/payments/orders/inventory/storefront UI is implemented.
- Existing public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms tests still pass.
- .env.example is updated only with placeholders if Phase 16 adds required variables.
- Payload types are regenerated only if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 16 complete only.
- No Phase 17 or later work is implemented.

Verification commands:
Run from the repository root:
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build

Also run package/app checks:
- pnpm --dir packages/forms lint
- pnpm --dir packages/forms typecheck
- pnpm --dir packages/forms test
- pnpm --dir packages/forms build
- pnpm --dir packages/plugins lint
- pnpm --dir packages/plugins typecheck
- pnpm --dir packages/plugins test
- pnpm --dir packages/plugins build
- pnpm --dir packages/builder-core lint
- pnpm --dir packages/builder-core typecheck
- pnpm --dir packages/builder-core test
- pnpm --dir packages/builder-core build
- pnpm --dir packages/builder-editor lint
- pnpm --dir packages/builder-editor typecheck
- pnpm --dir packages/builder-editor test
- pnpm --dir packages/builder-editor build
- pnpm --dir packages/themes lint
- pnpm --dir packages/themes typecheck
- pnpm --dir packages/themes test
- pnpm --dir packages/themes build
- pnpm --dir apps/web lint
- pnpm --dir apps/web typecheck
- pnpm --dir apps/web test
- pnpm --dir apps/web build

If a new commerce package is created, also run its lint/typecheck/test/build scripts.

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 16. Provide a review summary with:
- Files changed
- Packages added
- Commerce package/module added
- Provider strategy decision
- Adapter contracts added
- Medusa adapter skeleton
- Runtime config/env vars added
- Plugin/capability integration
- Membership/customer mapping decision
- Payload/content integration changes
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps