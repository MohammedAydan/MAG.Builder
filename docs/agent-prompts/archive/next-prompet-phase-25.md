You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 25 only.

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
- Phase 23 completed Multi-site and SaaS Readiness.
- Phase 24 completed Marketplace, Packaging, and Updates.

Current technical state:
- apps/web is a real Next.js 16 App Router app.
- Multi-site/SaaS readiness foundation exists from Phase 23.
- Hidden sites collection exists.
- Server-side site resolution exists.
- Site-aware filtering exists across content, forms, members, commerce, search, analytics, and automation.
- Marketplace/packaging/update foundation exists from Phase 24.
- packages/marketplace exists and owns:
  - typed nexpress-package-manifest validation
  - local allowlisted catalog
  - compatibility checks
  - integrity metadata checks
  - dry-run install/update/enable/disable planning
- Marketplace APIs exist under apps/web/src/app/api/marketplace if implemented in Phase 24.
- Marketplace service exists at apps/web/src/lib/marketplace/service.ts.
- Marketplace is dry-run only:
  - no remote fetch
  - no package-manager execution
  - no runtime code loading
  - no file mutation
  - no DB mutation from marketplace plans
- Marketplace audit/RBAC entries exist.
- OpenAPI was updated for marketplace endpoints if added.
- API platform and OpenAPI foundation exist from Phase 19.
- Webhooks/integrations foundation exists from Phase 20.
- MCP gateway foundation exists from Phase 21.
- Search, analytics, and automation foundation exists from Phase 22.
- packages/search exists and exports SearchAdapter, InMemorySearchAdapter, SearchService, typed query/document schemas.
- packages/analytics exists and exports AnalyticsEventSchema, AnalyticsService, hasSensitiveFields, NoopAnalyticsAdapter.
- packages/automation exists and exports AutomationEngine, allowlisted triggers/actions, AutomationRule schema.
- Search API exists at GET /api/search.
- Analytics API exists at GET /api/analytics/summary.
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
- Install API route exists at /api/install.
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
- apps/web typecheck should generate fresh Next route types before tsc when needed:
  - next typegen && tsc --noEmit
- Roles implemented:
  - super-admin
  - admin
  - editor
- Public members are not admin roles.
- Permission helpers exist under apps/web/src/lib/auth.
- Member helpers/services exist under apps/web/src/lib/members.
- Site helpers/services exist under apps/web/src/lib/sites.
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
- Multi-site/SaaS helpers exist from Phase 23.
- Marketplace helpers exist from Phase 24.
- Payload collections include, at minimum:
  - users
  - members
  - sites
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
  - any marketplace/update metadata collections added in Phase 24, if any
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
- packages/marketplace exists from Phase 24.
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
  - external package signature verification/key distribution is not implemented.
  - no dedicated marketplace UI.
  - marketplace install/update/enable/disable remains dry-run only.
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
  - no live-DB integration test for install/auth/audit/membership/commerce/webhooks/MCP/search/analytics/automation/multisite/marketplace yet.
  - dashboard protection is helper-test level rather than full e2e route tests.
  - no interactive mobile dashboard sidebar.
  - protected/private media is out of scope.
  - no final production hardening pass yet.

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
- docs/runbooks/multisite-saas-readiness.md
- docs/runbooks/marketplace-packaging-updates.md
- 03-phases/README.md
- 03-phases/phase-25-security-observability-hardening/plan.md
- 03-phases/phase-25-security-observability-hardening/tasks.md
- 03-phases/phase-25-security-observability-hardening/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-24-marketplace-packaging-updates/review.md

Goal:
Complete Phase 25 — Security, Observability, and Production Hardening only.

High-level purpose:
Perform a production-readiness hardening pass across security controls, observability foundations, runtime safety, operational checks, and deployment guardrails. This phase should close or document known hardening gaps, add security headers/CSP foundations, improve error/log sanitization, add structured observability primitives, add production readiness checks, and strengthen existing feature boundaries. It must not implement new product features, new marketplace execution, new commerce capabilities, dangerous MCP tools, payments, or unrelated UX expansions.

Implementation requirements:
1. Implement Security, Observability, and Production Hardening according to the Phase 25 plan.
2. Add a security hardening checklist mapped to OWASP ASVS 5.0.0 where practical.
3. Add or strengthen security headers:
   - Content-Security-Policy or CSP foundation
   - X-Frame-Options or frame-ancestors
   - Referrer-Policy
   - Permissions-Policy
   - X-Content-Type-Options
   - any other headers required by the plan
4. Add CSP carefully without breaking Next.js/Payload/admin/editor routes.
5. Add nonce or strict CSP only if practical and tested; otherwise document staged CSP rollout.
6. Add production runtime config validation checks without breaking static builds.
7. Add server-only secret exposure tests where practical.
8. Add logging redaction helpers if not already present.
9. Add observability primitives:
   - structured logger
   - safe error serializer
   - request id/correlation id helpers
   - health/readiness checks
   - metrics/tracing interface stubs if required
10. Add production readiness route or internal check if required by the plan.
11. Add rate-limit production notes and guardrails for in-memory limiters.
12. Add audit hardening decisions:
   - keep fail-open or change to fail-closed only if the plan explicitly requires it and tests prove it safe.
13. Add tests for headers, CSP behavior if implemented, redaction, safe errors, readiness checks, and config validation.
14. Add docs/runbook for security/observability/production hardening.
15. Update OpenAPI docs only if new API endpoints are added.
16. Update MCP tools only if Phase 25 explicitly requires safe read-only status/health tools.
17. Update IMPLEMENTATION_STATUS.md.
18. Update plans/context.md.
19. Update plans/SESSION_LOG.md.
20. Create or update plans/phase-25-security-observability-hardening/review.md.

Security headers/CSP requirements:
1. Configure headers in a central place appropriate for Next.js.
2. Do not break Payload admin, Puck editor, Next.js assets, or dynamic public rendering.
3. Avoid unsafe broad allowlists.
4. Do not allow arbitrary script sources.
5. Do not add unsafe-inline unless documented as temporary and constrained.
6. If strict CSP is not feasible for Payload/admin/editor yet, add report-only/staged policy or route-specific policies if the plan permits.
7. Add tests or documented verification for key routes.
8. Document known CSP exceptions.

Runtime config/secret requirements:
1. Keep env.ts split-schema pattern intact.
2. Do not eagerly validate runtime secrets during static build.
3. Production readiness checks may validate runtime secrets only inside server-only runtime paths.
4. No secrets in client bundles.
5. No secrets in logs, analytics, audit metadata, OpenAPI examples, MCP responses, API responses, search indexes, package manifests, or webhook payloads.
6. Add redaction tests for common secret keys:
   - password
   - secret
   - token
   - apiKey
   - authorization
   - DATABASE_URL
   - PAYLOAD_SECRET
   - MEDUSA secret/server keys
   - webhook signing secrets
   - marketplace signing keys
7. Do not add weak fallback secrets.

Observability requirements:
1. Add structured logging primitives if not already present.
2. Logs must redact sensitive fields.
3. Logs must include request id/correlation id where practical.
4. Errors returned to clients must be safe and generic.
5. Internal errors must not expose stack traces to clients.
6. Audit logs and application logs must remain conceptually separate.
7. Analytics must not become raw logging.
8. Observability stubs must not send data to external services unless explicitly configured and safe.
9. Do not add heavy observability providers unless the plan explicitly requires it.
10. If OpenTelemetry stubs are added, keep them provider-neutral and disabled by default unless configured.
11. Document operational dashboards/alerts as future deployment work if not implemented.

Health/readiness requirements:
1. Existing /api/health must continue to work.
2. Add readiness check only if required by the plan.
3. Readiness should be server-side and safe.
4. Readiness must not expose secrets or raw config.
5. Readiness may check installed state, database configuration presence, payload init readiness, and provider configuration status only as safe booleans/status labels.
6. Readiness must not leak connection strings, tokens, hostnames, private URLs, or raw provider errors.
7. Add tests for readiness response shape if implemented.

Rate-limit/abuse-control requirements:
1. Do not remove existing rate limits.
2. Document in-memory limiter limitations.
3. Add production guardrails or adapter interfaces if required by the plan.
4. Do not add paid/external rate-limit provider unless explicitly required.
5. Fail safely under invalid limiter config.
6. Ensure rate-limit responses do not leak internal metadata.

Access-control hardening requirements:
1. Confirm admin/dashboard/member/MCP/API/marketplace/webhook/commerce boundaries remain server-side.
2. Add regression tests for privilege escalation risks where practical.
3. Do not allow public members to become admin/editor/super-admin.
4. Do not expose protected collections publicly.
5. Do not weaken tenant/site isolation.
6. Do not trust client-side hiding.
7. Do not trust client-provided roles, permissions, prices, totals, tenant IDs, or system fields.
8. Keep Payload Local API usage server-only.
9. Use overrideAccess: false when operations should respect current-user permissions.
10. Document any overrideAccess: true usage.

Supply-chain hardening requirements:
1. Do not implement remote package install.
2. Do not execute marketplace packages.
3. Do not run package managers from the app.
4. Add dependency/supply-chain notes or checks only if required by the plan.
5. Do not add unnecessary dependencies.
6. If adding dependencies, justify them in the review.
7. Keep package manifests non-executable.

MCP hardening requirements:
1. Do not add dangerous MCP tools.
2. MCP tools must remain local, allowlisted, scoped, audited, and server-side.
3. MCP responses must not expose secrets.
4. No shell/filesystem/database/raw HTTP/env tools.
5. Keep origin/auth checks safe.

Multi-site hardening requirements:
1. Keep host/site resolution safe.
2. Do not blindly trust X-Forwarded-Host unless proxy trust is explicitly enabled and documented.
3. Prevent cross-tenant leakage.
4. Ensure search/analytics/automation/commerce/forms are site-aware where required.
5. Do not expose tenant-private data.

API/OpenAPI requirements:
1. Update OpenAPI only for new health/readiness/security endpoints.
2. Do not include secrets or real tokens in examples.
3. Security-sensitive endpoints must document auth requirements.
4. Public schemas must expose safe projections only.

Payload/access-control requirements:
1. Prefer no new Payload collections unless required by Phase 25 plan.
2. If collections are added, keep them hidden/protected.
3. Do not expose users, members, sites, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, webhook subscriptions, integration secrets, MCP state, analytics raw events, automation rules, marketplace/update metadata, admin data, tenant-private data, or system collections publicly.
4. Generate/update Payload types if collections are changed.
5. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers for new API endpoints if any.
- Route Handlers must live inside the app directory.
- Route Handlers use Web Request and Response APIs.
- Configure headers using supported Next.js mechanisms.
- Keep Server Components as default outside route handlers.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, /api/forms/[formId]/submit, /api/members/*, /api/commerce/*, /api/plugins/*, /api/templates/*, /api/webhooks/*, /api/mcp, /api/search, /api/analytics/summary, /api/marketplace/*, or API/OpenAPI routes.

Out of scope:
- Do not implement Phase 26 deployment/release automation unless Phase 25 explicitly requires a checklist/stub.
- Do not implement new product features.
- Do not implement new commerce capabilities.
- Do not implement payments, shipping, taxes, coupons, inventory, refunds, or marketplace vendor features.
- Do not implement remote package installation or auto-update execution.
- Do not implement dangerous MCP tools.
- Do not implement full observability vendor integration unless explicitly required.
- Do not implement full E2E test suite unless Phase 25 explicitly requires a minimal smoke foundation.
- Do not start Phase 26.

Acceptance criteria:
- Security hardening checklist exists.
- Security headers/CSP foundation exists or staged CSP plan is documented with tests.
- Runtime config/secret handling remains lazy and server-only.
- Redaction/safe error helpers exist and are tested.
- Observability primitives exist according to the plan.
- Health/readiness checks exist if required and expose safe data only.
- Rate-limit production limitations and guardrails are documented.
- Existing admin/dashboard/member/API/webhook/MCP/marketplace/commerce/multisite protections remain intact.
- Existing API/webhook/MCP/search/analytics/automation/multisite/marketplace/public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms/commerce tests still pass.
- New tests cover headers, CSP/readiness if implemented, redaction, safe errors, runtime config validation, and hardening regressions where practical.
- .env.example is updated only with placeholders if Phase 25 adds required variables.
- Payload types are regenerated only if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 25 complete only.
- No Phase 26 or later work is implemented.

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

Also run checks for packages/api, packages/webhooks, packages/mcp-gateway, packages/search, packages/analytics, packages/automation, and packages/marketplace if they exist:
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
- pnpm --dir packages/marketplace lint
- pnpm --dir packages/marketplace typecheck
- pnpm --dir packages/marketplace test
- pnpm --dir packages/marketplace build

If a new security/observability package is created, also run its lint/typecheck/test/build scripts.

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 25. Provide a review summary with:
- Files changed
- Packages added
- Security headers/CSP changes
- Runtime config/secret hardening
- Redaction/safe error helpers
- Observability/logging primitives
- Health/readiness checks
- Rate-limit/abuse-control changes
- Access-control hardening
- Supply-chain hardening
- API/OpenAPI changes
- MCP changes, if any
- Payload collections added/changed
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps