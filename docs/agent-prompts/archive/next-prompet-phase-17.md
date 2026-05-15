You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 17 only.

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
- Phase 16 completed the commerce service spike.

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
  - typed contracts for products
  - typed contracts for prices
  - typed contracts for carts
  - typed contracts for customers
  - typed contracts for orders
  - lazy runtime commerce config parsing
  - Medusa adapter skeleton
  - bounded Medusa health check
  - mock adapter for tests
- Provider strategy from Phase 16:
  - Medusa is the selected first commerce provider.
  - Medusa is kept behind an embedded server-side adapter boundary in NexPress.
  - No storefront UI, checkout, payments, orders, shipping, taxes, coupons, or inventory work was started in Phase 16.
- apps/web/src/lib/commerce/service.ts provides server-only commerce access.
- commerce service is gated through commerce-pack.
- commerce service fails closed when capability is disabled or Medusa config is missing/unsafe.
- docs/decisions/0004-commerce-service-spike.md records the commerce spike decision.
- docs/runbooks/commerce-service-spike.md documents commerce setup and limitations.
- Phase 16 did not change Payload collections, so no type regeneration or migration work was needed.
- Verification passed after Phase 16:
  - pnpm install
  - pnpm lint
  - pnpm typecheck
  - pnpm test
  - pnpm build
  - packages/commerce lint/typecheck/test/build
  - all required package checks
  - apps/web lint/typecheck/test/build
- Phase 16 notable tests:
  - packages/commerce: 9/9 passing
  - apps/web: 85/85 passing
- Current known gaps:
  - no live DB migration files for recent Payload collection additions because migration generation requires a live database.
  - no client-side form rendering component yet.
  - email actions are stubs.
  - form rate limiter is in-memory only; Redis/distributed rate limiting is needed for multi-process production.
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
  - no Commerce MVP yet.
  - no storefront commerce blocks yet.
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
- 03-phases/README.md
- 03-phases/phase-17-commerce-mvp/plan.md
- 03-phases/phase-17-commerce-mvp/tasks.md
- 03-phases/phase-17-commerce-mvp/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-16-commerce-service-spike/review.md

Goal:
Complete Phase 17 — Commerce MVP only.

High-level purpose:
Implement the first minimal commerce runtime on top of the Phase 16 commerce service boundary. This phase should add the smallest safe commerce MVP needed by the plan, likely product/catalog reads, customer/member mapping foundation, cart service foundation, and minimal server-side API/service operations. It must not implement advanced storefront blocks, full checkout, payment processing, shipping/tax engines, promotions/coupons, inventory management, refunds, or marketplace features unless explicitly required by Phase 17.

Implementation requirements:
1. Implement Commerce MVP according to the Phase 17 plan.
2. Keep packages/commerce as the commerce contract/provider boundary.
3. Do not bypass the commerce adapter boundary from Phase 16.
4. Extend packages/commerce only where required by Phase 17.
5. Keep Medusa behind a server-side adapter.
6. Do not put Medusa provider calls directly inside public React components.
7. Add product/catalog read support only if required by the plan.
8. Add cart foundation only if required by the plan.
9. Add customer/member mapping foundation only if required by the plan.
10. Add minimal commerce API route handlers only if required by the plan.
11. Add commerce service functions under apps/web/src/lib/commerce only as server-only code.
12. Add safe public projections for commerce data if public routes need them.
13. Add fail-closed behavior when commerce-pack is disabled.
14. Add fail-closed behavior when commerce runtime config is invalid or missing.
15. Add tests for commerce services, adapter behavior, capability gating, membership/customer mapping, and unsafe config handling.
16. Add or update commerce runbook documentation.
17. Update IMPLEMENTATION_STATUS.md.
18. Update plans/context.md.
19. Update plans/SESSION_LOG.md.
20. Create or update plans/phase-17-commerce-mvp/review.md.

Commerce MVP boundaries:
1. This phase may implement minimal catalog/product read behavior if required.
2. This phase may implement minimal cart lifecycle behavior if required.
3. This phase may implement minimal member-to-commerce-customer mapping if required.
4. This phase may implement mock-only order contract tests if required.
5. This phase must not implement real payments.
6. This phase must not collect card data.
7. This phase must not store PCI-sensitive data.
8. This phase must not implement full checkout unless Phase 17 explicitly requires a non-payment stub.
9. This phase must not implement shipping/taxes/promotions/inventory beyond adapter contracts or safe stubs.
10. This phase must not implement storefront builder blocks; those belong to Phase 18 unless Phase 17 explicitly says otherwise.

Medusa-specific requirements:
1. Use the Medusa adapter skeleton created in Phase 16.
2. Extend it only for the minimal MVP operations required by Phase 17.
3. Keep server keys and provider secrets server-only.
4. Do not expose Medusa admin tokens to the browser.
5. If using public Store API behavior, expose only safe public projections through NexPress-owned services/routes.
6. Do not couple pages directly to Medusa response shapes.
7. Normalize Medusa responses into NexPress commerce contract types.
8. Add bounded timeouts and safe error handling for external calls.
9. Do not log raw Medusa responses if they may contain sensitive data.
10. Do not scaffold a separate full Medusa backend inside this repo unless Phase 17 explicitly requires it.

Product/catalog requirements:
1. Product data exposed to public routes must be safe public data only.
2. Do not expose provider internals.
3. Do not expose unpublished or hidden provider data if the adapter can determine visibility.
4. Use stable commerce product IDs.
5. Validate product IDs/slugs.
6. Add tests for product list/detail adapters if implemented.
7. Do not add full CMS product modeling unless Phase 17 explicitly requires it.
8. Document how CMS pages/posts can link to commerce products in future phases.

Cart requirements:
1. Cart operations must be server-side mediated through NexPress services/routes.
2. Do not trust client-provided prices.
3. Do not trust client-provided totals.
4. Do not allow client to set arbitrary cart/customer/order fields.
5. Validate product/variant IDs server-side.
6. Validate quantities server-side.
7. Do not expose provider secrets or raw provider errors.
8. Add tests for unsafe cart input rejection if cart operations are implemented.
9. Do not implement payment or order completion in this phase unless explicitly required as a stub.

Customer/member mapping requirements:
1. Keep public members separate from admin/dashboard users.
2. If mapping members to commerce customers, store only minimal mapping data.
3. Do not duplicate unnecessary PII.
4. Do not expose member PII to public routes.
5. Do not create commerce customers for unauthenticated anonymous users unless Phase 17 explicitly requires guest cart support.
6. If guest cart support is added, document the identity model clearly.
7. Add tests for member/customer mapping if implemented.

Plugin/capability integration:
1. Commerce features must be gated by commerce-pack if the plan requires it.
2. Capability checks must run server-side.
3. Capability checks must fail closed.
4. Do not execute plugin code from manifests.
5. Do not implement plugin marketplace or remote plugins.
6. Do not allow plugins to inject arbitrary commerce provider logic.
7. Document whether Commerce MVP requires commerce-pack activation.

Payload/content integration:
1. Add Payload collections only if Phase 17 explicitly requires them.
2. If commerce settings/mapping collections are added, hide and protect them.
3. Do not create public write access for commerce data.
4. Do not expose users, members, audit logs, installation-state, plugin-states, form-submissions, admin data, or system collections.
5. Generate/update Payload types if collections are changed.
6. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Security requirements:
1. No commerce secrets in client components.
2. No provider secret keys in NEXT_PUBLIC variables.
3. No raw runtime config exposed to public UI.
4. No card data, PCI-sensitive data, payment tokens, or real payment handling in Phase 17.
5. Do not trust client-provided prices, totals, discounts, shipping, taxes, or inventory.
6. Validate all commerce input server-side.
7. Use allowlisted operations and typed contracts.
8. Do not expose raw provider errors to clients.
9. Do not log provider secrets, tokens, member PII, cart sensitive data, or raw external responses.
10. Server-side provider calls must have timeouts and safe error handling.
11. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin/forms/membership protections.
12. Client-side hiding is not a security boundary.
13. Public bundle should not include commerce admin/provider-secret code.
14. Be mindful of supply-chain risk; do not add unnecessary packages.
15. If a new dependency is required, justify it in the review.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers only if server endpoints are required.
- Route Handlers must live inside the app directory.
- Route Handlers use Web Request/Response APIs.
- Keep Server Components as default.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime commerce secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, or /api/forms/[formId]/submit.

Out of scope:
- Do not implement storefront commerce blocks. That belongs to Phase 18.
- Do not implement a full storefront UI unless Phase 17 explicitly requires minimal internal smoke pages.
- Do not implement payment processing.
- Do not implement payment provider integrations.
- Do not collect or store card data.
- Do not implement full checkout.
- Do not implement shipping calculators.
- Do not implement tax engines.
- Do not implement coupons/promotions.
- Do not implement inventory management.
- Do not implement refunds.
- Do not implement order admin UI.
- Do not implement marketplace/vendor features.
- Do not implement MCP.
- Do not implement CRM/newsletter features.
- Do not implement advanced customer accounts.
- Do not start Phase 18.

Acceptance criteria:
- Commerce MVP service layer exists.
- Commerce adapter contracts are extended only as required.
- Medusa adapter is used behind the service boundary.
- Commerce runtime config remains lazy/server-only.
- Commerce secrets are not exposed to the client.
- Commerce-pack capability gating fails closed.
- Minimal product/catalog behavior exists if required by the plan.
- Minimal cart/customer behavior exists if required by the plan.
- No real payments, card data, PCI-sensitive data, checkout completion, shipping/tax/coupon/inventory implementation is added unless explicitly required as a safe stub.
- Existing public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms tests still pass.
- New tests cover commerce MVP service behavior, adapter normalization, capability gating, unsafe config rejection, and unsafe input rejection.
- .env.example is updated only with placeholders if Phase 17 adds required variables.
- Payload types are regenerated only if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 17 complete only.
- No Phase 18 or later work is implemented.

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
Stop immediately after Phase 17. Provide a review summary with:
- Files changed
- Packages added
- Commerce MVP scope implemented
- Adapter contracts changed
- Medusa adapter changes
- Service/API routes added
- Product/catalog behavior
- Cart behavior
- Customer/member mapping behavior
- Plugin/capability integration
- Runtime config/env vars added
- Payload/content integration changes
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps