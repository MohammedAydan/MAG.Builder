You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 23 only.

Current completed state:
- Phase 00 completed the monorepo/bootstrap scaffold.
- Phase 01 completed product governance and ADRs.
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
- Phase 19 completed API Platform and OpenAPI.
- Phase 20 completed Webhooks and Integrations.
- Phase 21 completed MCP Native Gateway.
- Phase 22 completed Search, Analytics, and Automation.

Current technical state:
- apps/web is a real Next.js 16 App Router app.
- API platform and OpenAPI foundation exist from Phase 19.
- Webhooks/integrations foundation exists from Phase 20.
- MCP gateway foundation exists from Phase 21.
- Search, analytics, and automation foundation exists from Phase 22.
- packages/search exists and exports:
  - SearchAdapter
  - InMemorySearchAdapter
  - SearchService
  - typed query/document schemas
- packages/analytics exists and exports:
  - AnalyticsEventSchema with 9 allowlisted events
  - AnalyticsService
  - hasSensitiveFields
  - NoopAnalyticsAdapter
- packages/automation exists and exports:
  - AutomationEngine
  - 4 allowlisted triggers
  - 2 allowlisted actions
  - AutomationRule schema
- Search API exists:
  - GET /api/search
  - public/member aware
  - bounded and access-filtered
- Analytics API exists:
  - GET /api/analytics/summary
  - admin-only
  - aggregate counts only
  - no raw events
- Search behavior:
  - draft content is never indexed.
  - anonymous users get public docs only.
  - member auth is checked server-side.
  - query inputs are Zod-validated.
  - pagination is bounded with max 50.
- Analytics behavior:
  - discriminated union schema rejects unknown event names.
  - hasSensitiveFields blocks secrets before adapter.
  - IP addresses are omitted by design.
  - aggregates endpoint is admin-only.
- Automation behavior:
  - trigger payloads are validated.
  - action allowlist is enforced in code.
  - no handler means no execution path.
  - error messages do not leak internals.
  - automation is fail-safe.
- Current Phase 22 known gaps:
  - in-memory search index is process-local and needs production adapter replacement.
  - analytics adapter is Noop and needs production adapter replacement.
  - automation rules are hard-coded.
  - no Payload collection or admin UI for automation rules.
  - no scheduled/cron automation yet.
- @nexpress/mcp-gateway package exists and isolates JSON-RPC routing, tool registry, and scope handling.
- MCP endpoint exists at apps/web/src/app/api/mcp/route.ts.
- MCP tools currently implemented are read-only:
  - platform.health.read
  - content.published.list
- Dangerous MCP tools are explicitly not implemented:
  - no shell execution
  - no filesystem read/write
  - no raw database reads
  - no raw Payload Local API
  - no raw Medusa access
  - no arbitrary HTTP fetch
  - no env/secrets tools
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
- API platform helpers exist from Phase 19.
- Webhook/integration helpers exist from Phase 20.
- MCP helpers/package exist from Phase 21.
- Search/analytics/automation helpers exist from Phase 22.
- Payload collections include, at minimum:
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
  - any webhook/integration collections added in Phase 20
  - any MCP audit-related changes added in Phase 21
  - any search/analytics/automation collections added in Phase 22, if any
- pages and posts use Payload drafts via _status.
- Public content queries use overrideAccess: false where access control must be respected.
- Payload types exist at apps/web/src/payload-types.ts.
- packages/builder-core owns:
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
- packages/builder-editor integrates Puck as editor-only adapter.
- Puck is not the public renderer.
- packages/themes owns theme/template foundations.
- packages/plugins owns plugin/module foundations.
- packages/forms owns forms/workflow foundations.
- packages/commerce owns commerce contracts/provider adapter.
- packages/api owns API/OpenAPI platform helpers if created in Phase 19.
- packages/webhooks owns webhook/integration contracts/helpers if created in Phase 20.
- packages/mcp-gateway owns MCP JSON-RPC/tool/scope logic from Phase 21.
- packages/search, packages/analytics, and packages/automation exist from Phase 22.
- Provider strategy:
  - Medusa is the selected first commerce provider.
  - Medusa remains behind a server-side adapter boundary in NexPress.
  - Public/client code must not depend directly on Medusa internals.
- Commerce service is gated through commerce-pack and fails closed when disabled/misconfigured.
- Storefront commerce blocks exist from Phase 18.
- Webhook/integration foundation from Phase 20 includes:
  - event registry
  - outbound webhook delivery foundation
  - inbound webhook verification foundation
  - signature/replay protection foundation
  - integration registry/config validation
  - API/OpenAPI updates
- Current known gaps:
  - no live DB migration files for recent Payload collection additions because migration generation requires a live database.
  - guest carts are out of scope.
  - checkout remains test-mode only.
  - real payments are deferred.
  - shipping is deferred.
  - taxes are deferred.
  - coupons/promotions are deferred.
  - inventory sync is deferred.
  - no client-side form rendering component yet.
  - email actions are stubs.
  - form rate limiter is in-memory only.
  - no dedicated dashboard UI for plugin management.
  - no persisted site-wide theme selector yet.
  - no publish workflow UI.
  - no revision history/collaboration.
  - no relation-backed builder media resolution yet.
  - Puck is behind latest/upstream-deprecated but the builder kernel remains vendor-neutral.
  - audit is fail-open and not transactional.
  - install flow has two sequential writes without a DB transaction.
  - no live-DB integration test for install/auth/audit/membership/commerce/webhooks/MCP/search/analytics/automation yet.
  - dashboard protection is helper-test level rather than full e2e route tests.
  - no interactive mobile dashboard sidebar.
  - protected/private media is out of scope.
  - no multi-site or SaaS readiness foundation yet.

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
- any Phase 19 API/OpenAPI runbook/docs created in the repository
- any Phase 20 webhooks/integrations runbook/docs created in the repository
- any Phase 21 MCP runbook/docs created in the repository
- any Phase 22 search/analytics/automation runbook/docs created in the repository
- 03-phases/README.md
- 03-phases/phase-23-multi-site-saas-readiness/plan.md
- 03-phases/phase-23-multi-site-saas-readiness/tasks.md
- 03-phases/phase-23-multi-site-saas-readiness/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-22-search-analytics-automation/review.md

Goal:
Complete Phase 23 — Multi-site and SaaS Readiness only.

High-level purpose:
Build the first safe multi-site and SaaS readiness foundation for NexPress. This phase should add a site/tenant model, site resolution, tenant-aware access helpers, domain/slug mapping foundations, tenant isolation contracts, and safe defaults for future SaaS features. It must not implement billing, subscriptions, organizations/teams UI, paid plans, marketplace, tenant provisioning automation, or production-grade multi-region infrastructure.

Implementation requirements:
1. Implement Multi-site and SaaS Readiness according to the Phase 23 plan.
2. Add a Site or Tenant model/collection if required by the plan.
3. Add domain/slug mapping foundation if required by the plan.
4. Add server-side site resolution helpers.
5. Add tenant/site context helpers.
6. Add tenant-aware query helpers for content where required.
7. Add tenant-aware public route behavior where required.
8. Add tenant-aware admin/dashboard guard helpers where required.
9. Add safe default site behavior for existing single-site data.
10. Add migration/backfill plan for existing content to default site if required by the plan.
11. Add tests for site resolution, tenant isolation, tenant-aware content filters, and cross-tenant rejection.
12. Add docs/runbook for multi-site/SaaS readiness behavior.
13. Update API/OpenAPI docs only if new API endpoints are added.
14. Update MCP tools only if Phase 23 explicitly requires safe read-only tenant/site status tools.
15. Update IMPLEMENTATION_STATUS.md.
16. Update plans/context.md.
17. Update plans/SESSION_LOG.md.
18. Create or update plans/phase-23-multi-site-saas-readiness/review.md.

Site/Tenant model requirements:
1. Site/tenant IDs must be stable and normalized.
2. Site slugs must be unique and validated.
3. Domain mappings must be normalized and validated.
4. Reserved domains/slugs must be rejected.
5. Domain mappings must not allow localhost/private/internal metadata domains unless explicitly dev-only.
6. Site records must not be publicly writable.
7. Site settings must not expose secrets.
8. Public site metadata must be a safe projection only.
9. Admin-only site settings must remain protected.
10. A default site must exist or be logically handled for existing single-site content.

Tenant isolation requirements:
1. Cross-site/cross-tenant access must fail closed.
2. Every tenant-aware query must include site/tenant constraints where required.
3. Public routes must only resolve content for the active site.
4. Member access must be scoped to the correct site if Phase 23 requires site-scoped membership.
5. Admin/dashboard access must be scoped to the correct site if Phase 23 requires site-scoped admin operations.
6. Do not expose site A drafts/content/settings through site B.
7. Do not expose tenant IDs or internal site config unnecessarily.
8. Search must not return content from the wrong site.
9. Analytics summaries must not mix sites unless an authorized global/admin aggregation explicitly requests it.
10. Automation/search/index helpers must include site context where relevant.
11. Webhook/Integration/MCP tools must not leak cross-site data.
12. Tests must cover cross-tenant rejection.

Domain/site resolution requirements:
1. Site resolution must be server-side.
2. Host/header parsing must be safe and documented.
3. Do not blindly trust X-Forwarded-Host unless the deployment/proxy trust model is explicit.
4. Normalize hostnames.
5. Reject malformed hostnames.
6. Avoid open redirects.
7. Do not trust client-provided site IDs in public requests without validating against resolved site.
8. Local development fallback must be safe and documented.
9. Site resolution must not break /admin, /dashboard, /install, /api/health, or other system routes.
10. Site resolution must not eagerly validate runtime secrets during static build.

Payload/content integration requirements:
1. Add site/tenant relationship fields only if required by the plan.
2. If Pages/Posts/Forms/Media/Redirects need site fields, add them carefully and regenerate Payload types.
3. Existing published/draft behavior must remain intact.
4. Existing members-only content behavior must remain intact.
5. Existing builder rendering must remain intact.
6. Existing commerce blocks must remain intact.
7. Existing form endpoints must remain intact.
8. Existing search indexing must remain intact but become site-aware if required.
9. Existing analytics must remain privacy-safe and become site-aware if required.
10. Existing automation rules must remain safe and become site-aware if required.
11. Generate/update Payload types if collections are changed.
12. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Admin/dashboard requirements:
1. Do not build a full SaaS management UI unless Phase 23 explicitly requires a minimal placeholder.
2. If site selector is added, keep it minimal and permission-aware.
3. If super-admin/global admin behavior is added, define it explicitly.
4. If site-scoped admin roles are added, keep them separate from public members.
5. Do not allow public members to access site admin controls.
6. Do not weaken existing /admin or /dashboard protections.
7. Do not expose audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, webhook/integration secrets, or system collections through site dashboards.

Membership requirements:
1. Public members must not gain admin/site-owner permissions unless Phase 23 explicitly adds a safe model.
2. If site-scoped memberships are implemented, isolate members per site.
3. Do not leak member identity across sites.
4. Do not allow one site to enumerate members from another site.
5. Public auth routes must keep role escalation protections.
6. Session handling must not confuse site context and admin context.

Search/analytics/automation integration:
1. Search must be site-aware if content becomes site-scoped.
2. Search must not leak cross-site content.
3. Analytics capture must include safe site context only if required.
4. Analytics aggregates must be scoped by site unless authorized global aggregation is requested.
5. Automation triggers/actions must include site context where relevant.
6. Automation must not execute cross-site actions unless explicitly authorized.
7. MCP read-only tools must not leak cross-site content.

Commerce/forms/plugin/webhook integration:
1. Do not create cross-tenant commerce access.
2. Do not expose one site's cart/orders/customers to another site.
3. Forms/submissions must remain protected and site-scoped if site fields are added.
4. Webhooks/integrations must be site-scoped if subscriptions/settings are site-owned.
5. Plugin activation state must be global or site-scoped according to the Phase 23 plan; document the decision.
6. Do not execute plugin code from manifests.

API/OpenAPI requirements:
1. Update OpenAPI only for new API endpoints or changed request/response contracts.
2. Do not include real domains, secrets, tokens, private URLs, or tenant IDs from real data in examples.
3. Document site/tenant auth requirements for any new endpoints.
4. Public APIs must not allow cross-site data access through query parameters.
5. Admin APIs must enforce server-side permissions.

MCP requirements:
1. Do not add MCP tools unless Phase 23 explicitly requires read-only site status tools.
2. Any MCP tools added must be local, allowlisted, read-only, scoped, and audited.
3. MCP tools must not expose cross-site content.
4. Do not add dangerous MCP tools.

Security requirements:
1. Treat all host headers, query parameters, site IDs, domain mappings, and tenant IDs as untrusted input.
2. Enforce tenant/site isolation server-side.
3. Do not rely on client-side site selection as a security boundary.
4. No secrets in site records exposed to public clients.
5. No raw runtime config in public UI.
6. No cross-tenant data leakage.
7. No open redirects.
8. No trusting arbitrary X-Forwarded-Host without a documented proxy trust model.
9. No public access to admin/system collections.
10. No exposure of users, members, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, webhook subscriptions, integration secrets, MCP state, analytics raw events, automation rules, admin data, or system collections across tenants.
11. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin/forms/membership/commerce/API/webhook/MCP/search/analytics/automation protections.
12. Apply least privilege and fail closed.
13. If new dependencies are required, justify them in the review.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers for new API endpoints if any.
- Route Handlers must live inside the app directory.
- Route Handlers use Web Request and Response APIs.
- Keep Server Components as default outside route handlers.
- Use headers() or server-side request context carefully if needed for host resolution.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime tenant/site secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, /api/forms/[formId]/submit, /api/members/*, /api/commerce/*, /api/plugins/*, /api/templates/*, /api/webhooks/*, /api/mcp, /api/search, /api/analytics/summary, or API/OpenAPI routes.

Out of scope:
- Do not implement SaaS billing.
- Do not implement paid plans.
- Do not implement subscription management.
- Do not implement Stripe/payment integration.
- Do not implement organization/team UI unless Phase 23 explicitly requires a tiny placeholder.
- Do not implement invite flows unless Phase 23 explicitly requires a tiny foundation.
- Do not implement full tenant provisioning automation.
- Do not implement custom domain DNS verification unless Phase 23 explicitly requires a placeholder.
- Do not implement marketplace/vendor features.
- Do not implement multi-region infrastructure.
- Do not implement enterprise SSO.
- Do not implement dangerous MCP tools.
- Do not implement new commerce features.
- Do not start Phase 24.

Acceptance criteria:
- Site/tenant model exists if required by the Phase 23 plan.
- Server-side site resolution exists.
- Tenant/site context helpers exist.
- Tenant-aware content/query behavior exists where required.
- Cross-tenant access fails closed.
- Existing single-site behavior still works through a default site or safe fallback.
- Search/analytics/automation behavior is site-aware if required.
- Public routes still render.
- Admin/dashboard routes remain protected.
- Payload admin still works.
- API/OpenAPI routes still work.
- MCP gateway still works and remains safe.
- Existing API/webhook/MCP/search/analytics/automation/public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms/commerce tests still pass.
- New tests cover site resolution, domain normalization, tenant-aware access, cross-tenant rejection, and safe fallback behavior where practical.
- .env.example is updated only with placeholders if Phase 23 adds required variables.
- Payload types are regenerated if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 23 complete only.
- No Phase 24 or later work is implemented.

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

Also run checks for packages/api, packages/webhooks, packages/mcp-gateway, packages/search, packages/analytics, and packages/automation if they exist:
- pnpm --dir packages/api lint
- pnpm --dir packages/api typecheck
- pnpm --dir packages/api test
- pnpm --dir packages/api build
- pnpm --dir packages/webhooks lint
- pnpm --dir packages/webhooks typecheck
- pnpm --dir packages/webhooks test
- pnpm --dir packages/webhooks build
- pnpm --dir packages/mcp-gateway lint
- pnpm --dir packages/mcp-gateway typecheck
- pnpm --dir packages/mcp-gateway test
- pnpm --dir packages/mcp-gateway build
- pnpm --dir packages/search lint
- pnpm --dir packages/search typecheck
- pnpm --dir packages/search test
- pnpm --dir packages/search build
- pnpm --dir packages/analytics lint
- pnpm --dir packages/analytics typecheck
- pnpm --dir packages/analytics test
- pnpm --dir packages/analytics build
- pnpm --dir packages/automation lint
- pnpm --dir packages/automation typecheck
- pnpm --dir packages/automation test
- pnpm --dir packages/automation build

If a new multisite/SaaS package is created, also run its lint/typecheck/test/build scripts.

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 23. Provide a review summary with:
- Files changed
- Packages added
- Site/tenant model added
- Domain/site resolution approach
- Tenant context helpers
- Tenant-aware content/query behavior
- Search/analytics/automation site-awareness
- Admin/dashboard impact
- Membership impact
- API/OpenAPI changes
- MCP changes, if any
- Payload collections added/changed
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps