You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 19 only.

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
- Phase 18 completed storefront commerce blocks.

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
  - commerce.product-grid
  - commerce.product-detail
  - commerce.cart
  - commerce.collection-list
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
- Storefront commerce blocks from Phase 18 added:
  - commerce.product-grid
  - commerce.product-detail
  - commerce.cart
  - commerce.collection-list
- Phase 18 public rendering behavior:
  - storefront blocks render through NexPress-owned server components.
  - small client components are used only for add-to-cart/cart interactions.
  - no Medusa calls are made from client components.
  - browser stores only a local cart id pointer.
  - server validates variant ids and quantity.
  - product grid supports catalog or manual handles.
  - product detail resolves one handle.
  - commerce blocks expose only safe title/handle/price/variant projections.
  - disabled/misconfigured commerce states render safe placeholders.
  - guest carts remain out of scope.
  - checkout remains Phase 17 test-mode only.
  - no payment, card, shipping, tax, coupon, inventory, refund, marketplace, or MCP work was added.
- Phase 18 Payload/content integration:
  - no new Payload collections.
  - no Payload type regeneration.
  - no migrations generated.
- Phase 18 verification passed:
  - root pnpm install, lint, typecheck, test, build
  - package/app matrix for packages/commerce, packages/forms, packages/plugins, packages/builder-core, packages/builder-editor, packages/themes, and apps/web
  - packages/builder-core: 12/12
  - packages/builder-editor: 5/5
  - packages/commerce: 11/11
  - packages/forms: 41/41
  - packages/plugins: 9/9
  - packages/themes: 7/7
  - apps/web: 91/91
- Current known gaps:
  - no live DB migration files for recent Payload collection additions because migration generation requires a live database.
  - collection list is curated links rather than provider-synced collections.
  - guest carts are out of scope.
  - checkout remains test-mode only.
  - real payments are deferred.
  - shipping is deferred.
  - taxes are deferred.
  - coupons/promotions are deferred.
  - inventory sync is deferred.
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
- 03-phases/phase-19-api-platform-openapi/plan.md
- 03-phases/phase-19-api-platform-openapi/tasks.md
- 03-phases/phase-19-api-platform-openapi/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-18-storefront-commerce-blocks/review.md

Goal:
Complete Phase 19 — API Platform and OpenAPI only.

High-level purpose:
Build the first safe public/internal API platform layer for NexPress. This phase should add API versioning conventions, typed response/error envelopes, OpenAPI 3.1 specification generation/static output, endpoint documentation, auth requirements, rate-limit/security foundations where required, and tests. It must not implement MCP, webhook integrations, analytics automation, new commerce features, payments, shipping/taxes, or unrelated product features.

Implementation requirements:
1. Implement API Platform and OpenAPI according to the Phase 19 plan.
2. Define API platform conventions for versioning, response envelopes, pagination, errors, and auth metadata.
3. Add a centralized API contract/schema module if required by the plan.
4. Add OpenAPI 3.1.x generation or a static OpenAPI document according to the plan.
5. Add an endpoint for OpenAPI JSON only if required by the plan.
6. Add API docs route only if required by the plan.
7. Document existing public APIs:
   - /api/health
   - /api/install
   - /api/forms/[formId]/public
   - /api/forms/[formId]/submit
   - /api/members/*
   - /api/plugins/*
   - /api/templates/*
   - /api/commerce/*
   - any other current custom APIs that the plan requires
8. Do not document or expose Payload internal/admin APIs as public platform APIs unless the plan explicitly requires it.
9. Add OpenAPI security schemes for member auth, admin/dashboard auth, and any future API keys only if required by the plan.
10. Add typed API error helpers.
11. Add typed success response helpers.
12. Add tests for OpenAPI document validity, endpoint coverage, security metadata, and error envelope behavior.
13. Add docs/runbook for API platform usage and conventions.
14. Update IMPLEMENTATION_STATUS.md.
15. Update plans/context.md.
16. Update plans/SESSION_LOG.md.
17. Create or update plans/phase-19-api-platform-openapi/review.md.

API platform requirements:
1. API routes must use Next.js App Router Route Handlers.
2. Route Handlers must live inside the app directory.
3. APIs must use typed request validation where practical.
4. APIs must return consistent JSON responses where practical.
5. API errors must be consistent and must not leak internal stack traces.
6. API responses must not include secrets, tokens, raw provider config, raw Medusa responses, private member data, admin data, or system records.
7. Public APIs must only expose safe public projections.
8. Admin APIs must be server-side permission checked.
9. Member APIs must be member-session checked.
10. Capability-gated APIs must fail closed when required plugin capabilities are disabled.
11. APIs must not trust client-provided prices, totals, roles, permissions, system fields, or protected IDs.
12. APIs should use clear status codes.
13. API versioning must be documented even if current endpoints remain unversioned or v1.
14. Do not break existing API routes.

OpenAPI requirements:
1. Use OpenAPI 3.1.x, preferably 3.1.1 if supported by chosen tooling.
2. The OpenAPI document must be deterministic.
3. The OpenAPI document must include info, servers if appropriate, tags, paths, components, schemas, responses, and security where required.
4. The document must avoid secrets and environment-specific private URLs.
5. Internal admin-only endpoints must be marked clearly if included.
6. Public endpoints must document public-safe schemas only.
7. Member endpoints must document auth requirements.
8. Admin endpoints must document auth/permission requirements.
9. Commerce endpoints must not document provider internals or raw Medusa shapes.
10. Form endpoints must not expose workflow config schemas publicly.
11. Plugin/template/admin endpoints must not expose protected internals.
12. OpenAPI validation tests must fail if the document is malformed or missing required sections.
13. If docs UI is added, it must not require unsafe client-side execution from untrusted content.

API security requirements:
1. No secrets in API responses.
2. No raw runtime config in API responses.
3. No provider secret keys in NEXT_PUBLIC variables or OpenAPI examples.
4. Do not include real tokens, emails, passwords, DATABASE_URL, PAYLOAD_SECRET, MEDUSA secrets, webhook URLs, or private config in OpenAPI examples.
5. Do not expose users, members, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, admin data, or system collections through public APIs.
6. Do not expose raw webhook responses.
7. Do not expose raw Medusa responses.
8. Do not expose draft content through public APIs.
9. Do not expose members-only content to anonymous OpenAPI examples or public endpoints.
10. Client-side hiding is not a security boundary.
11. Admin/member APIs must enforce server-side authorization.
12. Payload Local API use must remain server-only.
13. Remember that Payload Local API skips access control by default unless overrideAccess is set to false.
14. Use overrideAccess: false when operations should respect collection access.
15. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin/forms/membership/commerce protections.
16. Be careful with CORS; do not open broad cross-origin access unless Phase 19 explicitly requires it and it is safe.

Rate limit and abuse-control requirements:
1. Do not remove existing forms rate-limit behavior.
2. If API platform adds common rate-limit helpers, keep them server-side and documented.
3. Do not add paid/external rate-limit providers unless Phase 19 explicitly requires it.
4. If in-memory rate limit is reused, document single-process limitations.
5. API docs/OpenAPI endpoint should not expose internal abuse-control state.

Payload requirements:
1. Respect Payload collection access control.
2. Do not create public read access to users, members, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, or system collections.
3. Keep Local API usage server-only.
4. Generate/update Payload types only if collections are changed.
5. Prefer no Payload collection changes in this phase unless explicitly required.
6. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Commerce requirements:
1. Do not add new commerce capabilities beyond documenting/current routes unless Phase 19 explicitly requires small API helpers.
2. Do not implement payments.
3. Do not collect card data.
4. Do not expose payment tokens.
5. Do not expose raw Medusa responses.
6. Do not trust client-provided prices/totals/order fields.
7. Existing commerce APIs must remain capability-gated and server-side validated.
8. OpenAPI schemas for commerce must use NexPress normalized response types, not raw provider types.

Forms requirements:
1. Public form definition endpoint must not document workflow config as public output.
2. Submission endpoint must not expose validation internals beyond safe error responses.
3. Form submissions must remain private.
4. Existing webhook SSRF protections must remain intact.

Membership requirements:
1. Public member auth routes must not document role assignment.
2. Public signup must not expose admin roles.
3. Member endpoints must not expose private member fields.
4. Member auth examples must not include real tokens.

Plugin/template requirements:
1. Plugin APIs must remain admin-capable only.
2. Template import/export APIs must remain admin-capable only.
3. OpenAPI docs must not include unsafe template manifests with secrets.
4. Do not expose plugin state publicly.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers for API endpoints.
- Route Handlers must live inside the app directory.
- Route Handlers use Web Request and Response APIs.
- Keep Server Components as default outside API handlers.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, /api/forms/[formId]/submit, /api/members/*, /api/commerce/*, /api/plugins/*, or /api/templates/*.

Out of scope:
- Do not implement MCP. That belongs to Phase 21.
- Do not implement webhooks/integrations beyond documenting existing APIs. Phase 20 handles Webhooks and Integrations.
- Do not implement analytics/automation.
- Do not implement new commerce features.
- Do not implement payment processing.
- Do not implement shipping/taxes/coupons/inventory/refunds.
- Do not implement marketplace/vendor features.
- Do not implement new builder blocks.
- Do not implement plugin marketplace.
- Do not implement full API key management unless Phase 19 explicitly requires a foundation only.
- Do not start Phase 20.

Acceptance criteria:
- API platform conventions are documented.
- Typed API response/error helpers exist if required by the plan.
- OpenAPI 3.1 document exists.
- OpenAPI document validates through tests.
- Existing custom APIs are documented according to the plan.
- Security schemes and endpoint auth metadata exist where required.
- Public APIs expose only safe projections.
- Admin/member APIs document and enforce server-side auth.
- Existing routes continue to work.
- Existing public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms/commerce tests still pass.
- New tests cover OpenAPI validity, API helpers, endpoint coverage, security metadata, and unsafe output rejection where practical.
- .env.example is updated only with placeholders if Phase 19 adds required variables.
- Payload types are regenerated only if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 19 complete only.
- No Phase 20 or later work is implemented.

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
Stop immediately after Phase 19. Provide a review summary with:
- Files changed
- Packages added
- API platform modules added
- API conventions added
- OpenAPI files/routes added
- OpenAPI version used
- API response/error helpers
- Endpoints documented
- Security schemes/auth metadata
- Rate-limit/abuse-control changes
- Payload/content integration changes
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps