You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 27 only.

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
- Phase 25 completed Security, Observability, and Production Hardening.
- Phase 26 completed Deployment, Release, and Production Operations.

Current technical state:
- apps/web is a real Next.js 16 App Router app.
- Payload CMS is integrated.
- Payload admin route exists at /admin/[[...segments]].
- Payload API route exists at /api/[...slug].
- Public routes exist:
  - /
  - /[slug]
  - /journal/[slug]
  - /login
  - /signup
  - /account
  - /robots.txt
  - /sitemap.xml
- System/API routes exist:
  - /api/health
  - /api/readiness
  - /api/install
  - /api/openapi.json
  - /api/forms/[formId]/public
  - /api/forms/[formId]/submit
  - /api/members/*
  - /api/commerce/*
  - /api/plugins/*
  - /api/templates/*
  - /api/webhooks/inbound
  - /api/mcp
  - /api/search
  - /api/analytics/summary
  - /api/marketplace/*
- Dashboard routes exist:
  - /dashboard
  - /dashboard/settings
  - /dashboard/pages
  - /dashboard/pages/[id]/builder
  - /dashboard/pages/[id]/builder/save
  - /dashboard/pages/[id]/preview
- Multi-site/SaaS readiness exists:
  - hidden sites collection
  - server-side site resolution
  - site-aware filtering across content, forms, members, commerce, search, analytics, and automation
  - optional proxy-trust flag in .env.example
- Security/observability hardening exists:
  - @nexpress/security
  - @nexpress/observability
  - staged CSP/security headers
  - safe error serialization
  - structured JSON logging
  - correlation/request ID tracking
  - /api/readiness
- Deployment/release operations exist from Phase 26:
  - Dockerfile with multi-stage production build and non-root user
  - .dockerignore
  - docker-compose.yml for local production-like testing with PostgreSQL
  - .github/workflows/ci.yml
  - docs/runbooks/deployment.md
  - docs/runbooks/operations.md
  - docs/runbooks/rollback.md
  - docs/runbooks/release-checklist.md
  - docs/architecture/environment-matrix.md
  - docs/checklists/production-readiness.md
  - docs/product/production-roadmap.md
- env.ts uses a split-schema pattern:
  - buildEnv validates only build-safe variables at module load
  - getRuntimeEnv() lazily validates runtime secrets inside handlers/scripts
  - env Proxy preserves backwards-compatible access
- apps/web typecheck should generate fresh Next route types before tsc when needed:
  - next typegen && tsc --noEmit
- Public members are separate from admin/dashboard users.
- Admin/dashboard users remain in users collection.
- Public members live in members collection.
- Public sign-up cannot assign admin/editor/super-admin roles.
- Published content can be gated for public vs members-only access.
- Marketplace remains dry-run only:
  - no remote fetch
  - no package-manager execution
  - no runtime code loading
  - no file mutation
  - no DB mutation from marketplace plans
- MCP remains safe:
  - read-only tools only unless explicitly changed in later work
  - no shell
  - no filesystem
  - no raw database
  - no raw Payload Local API
  - no raw Medusa access
  - no arbitrary HTTP fetch
  - no env/secrets tools
- Commerce remains bounded:
  - Medusa is behind server-side adapter boundary
  - no real payments
  - checkout remains test-mode only
  - shipping/taxes/coupons/inventory sync deferred
- packages currently include, at minimum:
  - @nexpress/builder-core
  - @nexpress/builder-editor
  - @nexpress/themes
  - @nexpress/plugins
  - @nexpress/forms
  - @nexpress/commerce
  - @nexpress/api
  - @nexpress/webhooks
  - @nexpress/mcp-gateway
  - @nexpress/search
  - @nexpress/analytics
  - @nexpress/automation
  - @nexpress/marketplace
  - @nexpress/security
  - @nexpress/observability
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
  - any search/analytics/automation collections added in Phase 22
  - any marketplace/update metadata collections added in Phase 24
- Phase 26 verification passed:
  - pnpm install
  - pnpm lint across all workspace packages
  - pnpm typecheck
  - pnpm test
  - pnpm build
  - app-level tests: 102 passing
  - package tests: 180+ passing
  - production bundle generated successfully for apps/web

Current known production blockers / deferred items:
- no live DB migration files for recent Payload collection additions because migration generation requires a live database.
- external package signature verification/key distribution is not implemented.
- no dedicated marketplace UI.
- marketplace install/update/enable/disable remains dry-run only.
- guest carts are out of scope.
- checkout remains test-mode only.
- real payments are deferred.
- shipping/taxes/coupons/inventory sync are deferred.
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
- no live-DB integration test for install/auth/audit/membership/commerce/webhooks/MCP/search/analytics/automation/multisite/marketplace.
- dashboard protection is helper-test level rather than full e2e route tests.
- no interactive mobile dashboard sidebar.
- protected/private media is out of scope.
- CSP is staged and not strict nonce-based yet.
- observability is provider-neutral/local primitives only, no production telemetry backend wired.

Before doing anything, read:
- AGENTS.md or the correct tool-specific instruction file for your tool
- PLAN.md
- IMPLEMENTATION_STATUS.md
- 01-final-decision-record.md
- docs/product/v1-scope.md
- docs/product/production-roadmap.md
- docs/architecture/environment-matrix.md
- docs/checklists/production-readiness.md
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
- docs/runbooks/multisite-saas-readiness.md
- docs/runbooks/marketplace-packaging-updates.md
- docs/runbooks/security-hardening.md
- docs/runbooks/deployment.md
- docs/runbooks/operations.md
- docs/runbooks/rollback.md
- docs/runbooks/release-checklist.md
- any Phase 19 API/OpenAPI runbook/docs created in the repository
- any Phase 20 webhooks/integrations runbook/docs created in the repository
- any Phase 21 MCP runbook/docs created in the repository
- any Phase 22 search/analytics/automation runbook/docs created in the repository
- 03-phases/README.md
- 03-phases/phase-27-final-release-candidate/plan.md
- 03-phases/phase-27-final-release-candidate/tasks.md
- 03-phases/phase-27-final-release-candidate/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-26-deployment-release-operations/review.md

Goal:
Complete Phase 27 — Final Release Candidate only.

High-level purpose:
Prepare the first stable release candidate for NexPress. This phase should focus on final validation, release-candidate documentation, final smoke coverage, route/API sanity checks, release notes, production blocker classification, and minor polish/fixes only. It must not implement new product features, new architecture, new marketplace execution, payments, dangerous MCP tools, or broad refactors.

Implementation requirements:
1. Implement Final Release Candidate tasks according to the Phase 27 plan.
2. Perform a final full-project validation pass.
3. Add or update final release candidate checklist.
4. Add or update release notes / changelog for the first stable candidate.
5. Add final production blocker report.
6. Add final smoke test matrix.
7. Add final API route sanity matrix.
8. Add final public route sanity matrix.
9. Add final admin/dashboard sanity matrix.
10. Add final auth/membership sanity matrix.
11. Add final multi-site sanity matrix.
12. Add final marketplace/MCP/webhook/API boundary sanity matrix.
13. Add final commerce safe-state sanity matrix.
14. Add final security/headers/readiness sanity matrix.
15. Add final deployment verification notes.
16. Fix only small bugs or inconsistencies discovered during final validation.
17. Do not add new features.
18. Do not expand scope.
19. Update IMPLEMENTATION_STATUS.md.
20. Update plans/context.md.
21. Update plans/SESSION_LOG.md.
22. Create or update plans/phase-27-final-release-candidate/review.md.

Final validation requirements:
1. Run the full verification matrix.
2. Verify all critical routes build.
3. Verify OpenAPI generation remains valid.
4. Verify Docker/build docs are still accurate.
5. Verify CI workflow matches actual root commands.
6. Verify production env matrix matches .env.example.
7. Verify release checklist references correct commands.
8. Verify rollback docs are internally consistent.
9. Verify production-roadmap blockers are accurate and not misleading.
10. Verify no obvious stale phase references remain in top-level status files.

Allowed changes:
1. Documentation corrections.
2. Release notes.
3. Final checklist additions.
4. Smoke matrix additions.
5. Small test fixes.
6. Small type/lint fixes.
7. Small config fixes needed to make documented commands match reality.
8. Minor safety fixes that do not expand feature scope.
9. Correcting stale paths, phase names, route names, command names, and package names.

Forbidden changes:
1. Do not implement new product features.
2. Do not add new commerce functionality.
3. Do not add payments.
4. Do not add real checkout/payment processing.
5. Do not add marketplace execution.
6. Do not add remote package installation.
7. Do not add dangerous MCP tools.
8. Do not add raw filesystem/shell/database tools.
9. Do not add new large dependencies unless absolutely required to fix a release-blocking issue.
10. Do not rewrite architecture.
11. Do not refactor large modules.
12. Do not introduce broad UI redesign.
13. Do not implement Phase 28 or unplanned future work.

Release candidate docs requirements:
1. Add or update docs/release/RELEASE_CANDIDATE.md if required by the plan.
2. Add or update docs/release/CHANGELOG.md if required by the plan.
3. Add or update docs/release/SMOKE_TEST_MATRIX.md if required by the plan.
4. Add or update docs/release/KNOWN_LIMITATIONS.md if required by the plan.
5. Add or update docs/release/GO_NO_GO_CHECKLIST.md if required by the plan.
6. Clearly label release status as release candidate, not final production GA, unless the plan explicitly says otherwise.
7. Document that this is a platform foundation release and list deferred production integrations.
8. Do not hide known blockers.
9. Do not claim unimplemented features are complete.

Smoke test matrix requirements:
Include route/API checks for at least:
- /
- /[slug]
- /journal/[slug]
- /login
- /signup
- /account
- /admin
- /dashboard
- /dashboard/pages
- /install
- /api/health
- /api/readiness
- /api/openapi.json
- /api/search
- /api/analytics/summary
- /api/mcp
- /api/webhooks/inbound
- /api/forms/[formId]/public
- /api/forms/[formId]/submit
- /api/commerce/products
- /api/commerce/cart
- /api/marketplace/*
- /robots.txt
- /sitemap.xml

Smoke tests may be documented if automated E2E is out of scope, unless Phase 27 explicitly requires an automated smoke script.

Security boundary validation requirements:
1. Public members cannot access /admin or /dashboard.
2. Public signup cannot assign admin roles.
3. Anonymous users cannot access members-only content.
4. Draft content is not public.
5. Search does not expose draft/private/cross-site content.
6. Analytics summary is admin-only.
7. MCP requires auth/scopes and exposes only safe read-only tools.
8. Marketplace remains dry-run only.
9. Webhook secrets are not exposed.
10. Commerce does not trust client prices/totals.
11. Commerce disabled/misconfigured states fail closed.
12. Site/tenant isolation remains server-side.
13. Security headers are applied.
14. Readiness does not leak secrets.
15. OpenAPI examples do not include secrets.

Deployment/release validation requirements:
1. Verify Dockerfile does not include secrets.
2. Verify docker-compose is local/dev-production-like only.
3. Verify CI does not require production secrets.
4. Verify .env.example contains placeholders only.
5. Verify production environment matrix aligns with code.
6. Verify migration docs warn against destructive production migration flows.
7. Verify backup-before-migration is documented.
8. Verify rollback docs are clear about DB rollback risk.
9. Verify readiness/health routes are documented.
10. Verify CSP staged rollout is documented.

Testing requirements:
1. Run root checks:
   - pnpm install
   - pnpm lint
   - pnpm typecheck
   - pnpm test
   - pnpm build
2. Run explicit package/app checks where required by the Phase 27 plan.
3. If Docker validation is required by the plan, perform a safe build-only check if practical and document if skipped.
4. If e2e/smoke automation is added, keep it minimal and safe.
5. Do not require live production secrets.
6. Do not require live payment/Medusa providers.
7. Do not run destructive DB operations.

Security requirements:
1. No secrets committed.
2. No real credentials in docs/examples.
3. No raw production URLs or private infrastructure details unless placeholder examples.
4. No new public endpoints exposing config.
5. No dangerous MCP tools.
6. No marketplace execution.
7. No package-manager execution from app runtime.
8. No payment/card handling.
9. Keep all previous security boundaries intact.
10. Do not hide known security limitations.

Payload/access-control requirements:
1. Prefer no Payload collection changes in Phase 27.
2. If collections are changed, justify why it is required for release candidate readiness.
3. Keep protected collections protected.
4. Do not expose users, members, sites, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, webhook subscriptions, integration secrets, MCP state, analytics raw events, automation rules, marketplace/update metadata, admin data, tenant-private data, or system collections publicly.
5. Generate/update Payload types if collections change.
6. Add migrations only if live DB is available and plan requires it; otherwise document migration gap consistently.

Next.js requirements:
- Use App Router conventions.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime secrets during static build.
- Keep public routes stable.
- Do not break existing routes or APIs.
- Keep typecheck route type generation behavior correct.

Out of scope:
- Do not implement new product features.
- Do not implement new commerce capabilities.
- Do not implement payments.
- Do not implement shipping/taxes/coupons/inventory/refunds.
- Do not implement marketplace execution.
- Do not implement remote package installation.
- Do not implement dangerous MCP tools.
- Do not implement broad observability provider integration.
- Do not implement full E2E test platform unless Phase 27 explicitly requires a small smoke foundation.
- Do not start any later phase.

Acceptance criteria:
- Final release candidate review exists.
- Release notes/changelog exist if required.
- Final smoke test matrix exists.
- Final production blocker/known limitations list exists.
- Go/no-go checklist exists if required.
- Deployment/release docs are internally consistent.
- Production env matrix aligns with .env.example and runtime config.
- No new product scope is added.
- Existing security boundaries remain intact.
- Existing API/webhook/MCP/search/analytics/automation/multisite/marketplace/security/deployment/public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms/commerce tests still pass.
- pnpm install passes.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- Docker/CI/deployment docs are accurate to the current scripts.
- IMPLEMENTATION_STATUS.md marks Phase 27 complete only.

Verification commands:
Run from the repository root:
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build

Also run package/app checks as required by the plan, especially:
- pnpm --dir apps/web lint
- pnpm --dir apps/web typecheck
- pnpm --dir apps/web test
- pnpm --dir apps/web build

Run explicit package checks for all packages with scripts if practical:
- packages/api
- packages/automation
- packages/analytics
- packages/builder-core
- packages/builder-editor
- packages/commerce
- packages/forms
- packages/marketplace
- packages/mcp-gateway
- packages/observability
- packages/plugins
- packages/search
- packages/security
- packages/themes
- packages/webhooks

If Docker validation is required and practical:
- docker build -t nexpress-rc .
- docker compose config

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 27. Provide a review summary with:
- Files changed
- Packages added
- Release candidate docs added
- Smoke test matrix
- Go/no-go checklist
- Known limitations/blockers
- Deployment docs corrections
- CI/Docker verification
- API/OpenAPI validation
- Security boundary validation
- Payload collections added/changed
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Final release candidate status