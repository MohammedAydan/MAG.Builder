You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 18 only.

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
- Phase 16 completed commerce service spike.
- Phase 17 completed Commerce MVP.

Current technical state:
- apps/web is a real Next.js 16 App Router app.
- Public routes exist:
  - /
  - /[slug]
  - /journal/[slug]
  - /login
  - /signup
  - /account
  - /robots.txt
  - /sitemap.xml
- Payload admin route exists at /admin/[[...segments]].
- Payload API route exists at /api/[...slug].
- Health route exists at /api/health.
- Install route exists at /install.
- Install API exists at /api/install.
- Dashboard routes exist:
  - /dashboard
  - /dashboard/settings
  - /dashboard/pages
  - /dashboard/pages/[id]/builder
  - /dashboard/pages/[id]/builder/save
  - /dashboard/pages/[id]/preview
- Public members are separate from admin/dashboard users.
- Admin/dashboard users remain in the users collection.
- Public members live in the members collection.
- Public sign-up cannot assign admin/editor/super-admin roles.
- Published content can be gated for public vs members-only access.
- typed env validation exists at apps/web/src/lib/env.ts.
- env.ts uses a split-schema pattern:
  - buildEnv validates only build-safe variables at module load.
  - getRuntimeEnv() lazily validates runtime secrets inside handlers/scripts.
  - env Proxy preserves backwards-compatible access.
- Roles implemented:
  - super-admin
  - admin
  - editor
- Public members are not admin roles.
- Permission helpers exist under apps/web/src/lib/auth.
- Member helpers/services exist under apps/web/src/lib/members.
- Dashboard helpers exist under apps/web/src/lib/dashboard.
- Audit helpers exist under apps/web/src/lib/audit.
- Content helpers exist under apps/web/src/lib/content.
- Template helpers exist under apps/web/src/lib/templates.
- Plugin helpers/services exist under apps/web/src/lib/plugins.
- Forms helpers/services exist under apps/web/src/lib/forms.
- Commerce service helpers exist under apps/web/src/lib/commerce.
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
  - commerce-customers
  - commerce-orders
- pages and posts use Payload drafts via _status.
- Public content queries use overrideAccess: false where access control must be respected.
- Payload types exist at apps/web/src/payload-types.ts.
- packages/builder-core exists and owns:
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
- packages/builder-editor exists and integrates @measured/puck@0.20.2 as editor-only adapter.
- Puck is not the public renderer.
- packages/themes exists and owns theme/template foundations.
- packages/plugins exists and owns plugin/module foundations.
- packages/forms exists and owns forms/workflow foundations.
- packages/commerce exists and owns:
  - typed contracts for catalog products and variants
  - typed contracts for prices
  - typed contracts for carts
  - typed contracts for customers
  - typed contracts for checkout
  - typed contracts for orders
  - lazy runtime commerce config parsing
  - Medusa adapter
  - bounded Medusa health check
  - mock adapter for tests
- Provider strategy:
  - Medusa is the selected first commerce provider.
  - Medusa remains behind a server-side adapter boundary in NexPress.
  - Public/client code must not depend directly on Medusa internals.
- apps/web/src/lib/commerce/service.ts provides server-only commerce access.
- Commerce service is gated through commerce-pack.
- Commerce service fails closed when capability is disabled or Medusa config is missing/unsafe.
- Commerce MVP from Phase 17 added:
  - member-authenticated cart and checkout orchestration
  - hidden member-to-commerce-customer mapping
  - admin-visible order snapshots
  - server-side /api/commerce/* routes for products, carts, checkout, and member orders
  - Payload collections commerce-customers and commerce-orders
  - updated RBAC/audit hooks
  - docs/runbooks/commerce-mvp.md
- Phase 17 verification passed:
  - root pnpm install, lint, typecheck, test, build
  - packages/commerce lint/typecheck/test/build
  - required package checks
  - apps/web generate:types, lint, typecheck, test, build
  - packages/commerce tests: 11/11 passing
  - apps/web tests: 89/89 passing
- Current known gaps:
  - no live DB migration files for recent Payload collection additions because migration generation requires a live database.
  - checkout can fall back to a local test-mode order snapshot.
  - guest carts are deferred.
  - real payments are deferred.
  - shipping is deferred.
  - taxes are deferred.
  - coupons/promotions are deferred.
  - inventory sync is deferred.
  - storefront commerce blocks are not implemented yet.
  - webhook reconciliation is deferred.
  - no client-side form rendering component yet.
  - email actions are stubs.
  - form rate limiter is in-memory only.
  - no dedicated dashboard UI for plugin management.
  - no persisted site-wide theme selector yet.
  - no publish workflow UI.
  - no revision history/collaboration.
  - no relation-backed builder media resolution yet.
  - Puck 0.20.2 is upstream-deprecated / behind latest, but the builder kernel remains vendor-neutral.
  - audit is fail-open and not transactional.
  - install flow has two sequential writes without a DB transaction.
  - no live-DB integration test for install/auth/audit/membership/commerce yet.
  - dashboard protection is helper-test level rather than full e2e route tests.
  - no interactive mobile dashboard sidebar.
  - protected/private media is out of scope.
  - no MCP gateway yet.

Before doing anything, read:
- AGENTS.md or the correct tool-specific instruction file for your tool
- PLAN.md
- IMPLEMENTATION_STATUS.md
- 01-final-decision-record.md
- docs/product/v1-scope.md
- docs/decisions/README.md
- docs/decisions/0002-v1-product-scope-freeze.md
- docs/decisions/0003-v1-architecture-constraints.md
- docs/decisions/0004-commerce-service-spike.md
- docs/runbooks/migrations.md
- docs/runbooks/installation.md
- docs/runbooks/identity-rbac-audit.md
- docs/runbooks/themes-templates.md
- docs/runbooks/plugins-modules.md
- docs/runbooks/forms-workflows.md
- docs/runbooks/membership-protected-routes.md
- docs/runbooks/commerce-service-spike.md
- docs/runbooks/commerce-mvp.md
- 03-phases/README.md
- 03-phases/phase-18-storefront-commerce-blocks/plan.md
- 03-phases/phase-18-storefront-commerce-blocks/tasks.md
- 03-phases/phase-18-storefront-commerce-blocks/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-17-commerce-mvp/review.md

Goal:
Complete Phase 18 — Storefront Commerce Blocks only.

High-level purpose:
Add safe storefront commerce builder blocks and public rendering integration on top of the existing Commerce MVP service boundary. This phase should expose product/catalog/cart UI building blocks through the builder system and visual editor where required, while keeping all sensitive commerce operations server-side. It must not implement real payments, advanced checkout, shipping, taxes, coupons, inventory sync, marketplace/vendor features, or MCP.

Implementation requirements:
1. Implement Storefront Commerce Blocks according to the Phase 18 plan.
2. Keep @nexpress/builder-core as the public rendering source of truth.
3. Add commerce-related builder blocks only as required by the Phase 18 plan.
4. Add storefront block editor mappings in @nexpress/builder-editor only if required by the plan.
5. Do not make Puck the public renderer.
6. Keep Puck/editor code out of public routes.
7. Use apps/web/src/lib/commerce service functions instead of calling Medusa directly from public components.
8. Do not put Medusa SDK/client calls directly inside React public components.
9. Add safe public projections for product/cart data.
10. Add block props validation for product IDs, product handles/slugs, limits, layout variants, and CTA behavior.
11. Add fallback/empty/error states that do not expose provider internals.
12. Add tests for commerce block schemas, rendering behavior, editor mapping, unsafe props rejection, and public route compatibility.
13. Update docs/runbooks/commerce-mvp.md or add a storefront blocks runbook if required.
14. Update IMPLEMENTATION_STATUS.md.
15. Update plans/context.md.
16. Update plans/SESSION_LOG.md.
17. Create or update plans/phase-18-storefront-commerce-blocks/review.md.

Allowed block scope:
Implement only the blocks required by Phase 18. Likely candidates:
- commerce.product-list or commerce.product-grid
- commerce.product-card
- commerce.product-detail-summary
- commerce.add-to-cart
- commerce.cart-summary
- commerce.checkout-link or checkout-status placeholder

Do not implement all of them unless the Phase 18 plan explicitly requires them. Keep the scope minimal.

Builder-core requirements:
1. Commerce blocks must be typed and versioned through the existing builder schema.
2. Commerce block props must be strictly validated.
3. Commerce block props must not accept arbitrary code, raw HTML, scripts, or provider secrets.
4. Commerce block props must not accept client-controlled prices, totals, discounts, inventory, taxes, or shipping values.
5. Product references must use stable product ids/handles/slugs according to the commerce contract.
6. Unknown/invalid blocks must continue to fail safely.
7. Invalid commerce block props must fail safely.
8. Public renderer must not crash if commerce service is disabled.
9. Public renderer must not crash if Medusa config is missing.
10. Public renderer must show safe empty/disabled states when commerce-pack is disabled.
11. Public renderer must not expose raw provider errors.

Builder-editor requirements:
1. Add editor mappings only for blocks added to builder-core.
2. Editor mapping must not allow arbitrary provider data injection.
3. Editor mapping must not allow editors to set prices/totals/order fields manually.
4. Editor mapping must validate product references and layout options where practical.
5. Keep editor-only code inside packages/builder-editor or dashboard/editor folders.
6. Do not import editor code into public routes.
7. Do not expose runtime commerce config to the editor client.
8. Add tests for editor config if mappings are added.

Public rendering requirements:
1. Public rendering must use @nexpress/builder-core and server-side commerce services.
2. Public commerce blocks must render safe projections only.
3. Public commerce blocks must not expose provider secrets, raw config, raw provider responses, private member data, admin data, or order internals.
4. Product list/detail states must handle disabled commerce, missing config, provider failure, empty products, and invalid references.
5. Add-to-cart/cart blocks must validate all submitted input server-side.
6. Do not trust client-provided prices, totals, discounts, shipping, taxes, or inventory.
7. If Client Components are needed for cart interactivity, keep them small and call NexPress-owned APIs only.
8. Do not call Medusa directly from client components.
9. Do not include commerce admin/provider-secret code in the public bundle.
10. Keep public routes stable.

Cart/add-to-cart requirements:
1. Add-to-cart must be mediated by NexPress server APIs/services.
2. Validate product and variant IDs server-side.
3. Validate quantity server-side.
4. Do not trust client-provided prices or product metadata.
5. Do not allow client to set arbitrary cart/customer/order fields.
6. Member-authenticated cart behavior must respect Phase 17 membership/customer mapping.
7. If guest cart is out of scope, do not implement guest carts.
8. If guest cart UI is shown, it must fail safely or prompt login according to the plan.
9. Do not complete checkout or process payment in Phase 18.
10. Do not store card data or PCI-sensitive data.

Checkout-related requirements:
1. Do not implement real checkout/payment.
2. Do not integrate payment providers.
3. Do not collect card data.
4. Do not store payment tokens.
5. If a checkout link/status block is required, it must only use the safe Phase 17 checkout orchestration or a safe placeholder according to the plan.
6. Make clear in code/tests/docs that payment/shipping/tax/coupon flows remain out of scope.

Commerce capability integration:
1. Commerce blocks must fail closed if commerce-pack is disabled.
2. Capability checks must run server-side for all commerce service operations.
3. Do not execute plugin code from manifests.
4. Do not implement marketplace or remote plugins.
5. Do not allow plugins to inject arbitrary commerce provider logic.
6. Document behavior when commerce-pack is disabled.

Payload/content integration:
1. Add Payload collections only if Phase 18 explicitly requires them.
2. Prefer no new Payload collections unless the plan requires storefront block metadata.
3. Do not create public write access for commerce data.
4. Do not expose users, members, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, admin data, or system collections.
5. Generate/update Payload types if collections are changed.
6. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Security requirements:
1. No commerce secrets in client components.
2. No provider secret keys in NEXT_PUBLIC variables.
3. No raw runtime config exposed to public UI.
4. No raw Medusa responses exposed to clients.
5. No card data, PCI-sensitive data, payment tokens, or real payment handling in Phase 18.
6. Do not trust client-provided prices, totals, discounts, shipping, taxes, inventory, customer IDs, or order IDs.
7. Validate all commerce input server-side.
8. Use allowlisted operations and typed contracts.
9. Do not expose raw provider errors to clients.
10. Do not log provider secrets, tokens, member PII, cart sensitive data, or raw external responses.
11. Server-side provider calls must have timeouts and safe error handling.
12. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin/forms/membership/commerce protections.
13. Client-side hiding is not a security boundary.
14. Public bundle should not include commerce admin/provider-secret code.
15. Do not add unnecessary third-party packages.
16. If a new dependency is required, justify it in the review.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers only if server endpoints are required.
- Route Handlers must live inside the app directory.
- Route Handlers use Web Request and Response APIs.
- Keep Server Components as default.
- Client Components are allowed only for minimal cart/product interactivity.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime commerce secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, /api/forms/[formId]/submit, or existing /api/commerce/* routes.

Out of scope:
- Do not implement real payment processing.
- Do not implement payment provider integrations.
- Do not collect or store card data.
- Do not implement full checkout completion beyond the safe Phase 17 MVP behavior.
- Do not implement shipping calculators.
- Do not implement tax engines.
- Do not implement coupons/promotions.
- Do not implement inventory sync.
- Do not implement refunds.
- Do not implement order admin UI.
- Do not implement marketplace/vendor features.
- Do not implement MCP.
- Do not implement CRM/newsletter features.
- Do not implement advanced customer accounts.
- Do not start Phase 19.

Acceptance criteria:
- Storefront commerce blocks exist according to the Phase 18 plan.
- Commerce blocks are registered in @nexpress/builder-core.
- Commerce blocks have strict prop validation.
- Editor mappings exist only if required.
- Public rendering uses @nexpress/builder-core and NexPress commerce services.
- Public rendering does not use Puck.
- Public rendering does not call Medusa directly from client components.
- Commerce blocks fail safely when commerce is disabled or misconfigured.
- Product/cart block inputs are validated server-side.
- Commerce secrets are not exposed to clients.
- No real payment, card data, shipping, tax, coupon, inventory sync, refund, marketplace, or MCP work is implemented.
- Existing public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms/commerce tests still pass.
- New tests cover commerce block schemas, rendering, editor mappings if any, capability gating, disabled/misconfigured states, and unsafe input rejection.
- .env.example is updated only with placeholders if Phase 18 adds required variables.
- Payload types are regenerated only if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 18 complete only.
- No Phase 19 or later work is implemented.

Verification commands:
Run from the repository root:
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build

Also run package/app checks:
- pnpm --dir packages/commerce lint
- pnpm --dir packages/commerce typecheck
- pnpm --dir packages/commerce test
- pnpm --dir packages/commerce build
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

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 18. Provide a review summary with:
- Files changed
- Packages added
- Storefront commerce blocks added
- Builder-core changes
- Builder-editor changes
- Public rendering changes
- Service/API route changes
- Product block behavior
- Cart/add-to-cart behavior
- Checkout-related behavior
- Commerce capability integration
- Payload/content integration changes
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps