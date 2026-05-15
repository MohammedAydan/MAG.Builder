You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 26 only.

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
- Public members are separate from admin/dashboard users.
- Admin/dashboard users remain in the users collection.
- Public members live in the members collection.
- Public sign-up cannot assign admin/editor/super-admin roles.
- Multi-site/SaaS readiness exists:
  - hidden sites collection
  - server-side site resolution
  - site-aware filtering across content, forms, members, commerce, search, analytics, and automation
  - optional proxy-trust flag in .env.example
- API platform and OpenAPI foundation exists.
- Webhooks/integrations foundation exists.
- MCP gateway foundation exists.
- Search, analytics, and automation foundation exists.
- Marketplace/packaging/update foundation exists.
- Security/observability hardening exists from Phase 25.
- packages/security exists and provides:
  - baseline security headers
  - staged Content-Security-Policy foundation
  - X-Frame-Options / frame protections
  - X-Content-Type-Options
  - Strict-Transport-Security
  - Permissions-Policy
  - other baseline hardening headers as implemented
- packages/observability exists and provides:
  - structured JSON logger
  - field redaction
  - safe error serialization
  - AsyncLocalStorage-based correlation/request ID tracking
- /api/readiness exists and returns safe readiness booleans/status without leaking env data.
- MCP gateway route is hardened to use safe observability logging.
- Security hardening runbook exists:
  - docs/runbooks/security-hardening.md
- Phase 25 documented:
  - staged CSP without strict nonces for now due to Payload Admin / editor / Next.js constraints
  - in-memory rate-limit production limitations
  - pnpm audit warnings from Payload CMS / monaco-editor dependencies
- env.ts uses a split-schema pattern:
  - buildEnv validates only build-safe variables at module load
  - getRuntimeEnv() lazily validates runtime secrets inside handlers/scripts
  - env Proxy preserves backwards-compatible access
- apps/web typecheck should generate fresh Next route types before tsc when needed:
  - next typegen && tsc --noEmit
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
- Marketplace remains dry-run only:
  - no remote fetch
  - no package-manager execution
  - no runtime code loading
  - no file mutation
  - no DB mutation from marketplace plans
- MCP remains safe:
  - read-only tools only unless later phase explicitly adds more
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
  - no live-DB integration test for install/auth/audit/membership/commerce/webhooks/MCP/search/analytics/automation/multisite/marketplace.
  - dashboard protection is helper-test level rather than full e2e route tests.
  - no interactive mobile dashboard sidebar.
  - protected/private media is out of scope.
  - CSP is staged and not strict nonce-based yet.
  - observability is provider-neutral/local primitives only, no production telemetry backend wired.
  - production deployment/release operations are not finalized yet.

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
- docs/runbooks/multisite-saas-readiness.md
- docs/runbooks/marketplace-packaging-updates.md
- docs/runbooks/security-hardening.md
- any Phase 19 API/OpenAPI runbook/docs created in the repository
- any Phase 20 webhooks/integrations runbook/docs created in the repository
- any Phase 21 MCP runbook/docs created in the repository
- any Phase 22 search/analytics/automation runbook/docs created in the repository
- 03-phases/README.md
- 03-phases/phase-26-deployment-release-operations/plan.md
- 03-phases/phase-26-deployment-release-operations/tasks.md
- 03-phases/phase-26-deployment-release-operations/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-25-security-observability-hardening/review.md

Goal:
Complete Phase 26 — Deployment, Release, and Production Operations only.

High-level purpose:
Prepare NexPress for production deployment and controlled releases. This phase should add deployment documentation, release checklists, environment matrices, production operation runbooks, migration/backup/recovery procedures, CI/CD validation foundations, and release artifact verification. It must not implement new product features, marketplace execution, payments, dangerous MCP tools, or broad infrastructure automation beyond safe checklists/scripts required by the phase plan.

Implementation requirements:
1. Implement Deployment, Release, and Production Operations according to the Phase 26 plan.
2. Add deployment runbook(s) for supported environments.
3. Add production environment variable matrix.
4. Add release checklist.
5. Add rollback checklist.
6. Add backup/restore operational checklist.
7. Add migration execution checklist.
8. Add preflight production readiness checklist.
9. Add post-deploy verification checklist.
10. Add CI/CD validation foundation if required by the plan.
11. Add release artifact verification scripts or docs if required by the plan.
12. Add Dockerfile / container docs only if required by the plan.
13. Add process manager / hosting guidance only if required by the plan.
14. Add health/readiness monitoring guidance.
15. Add logging/observability operation guidance.
16. Add security operations guidance:
    - secret rotation
    - incident response
    - dependency audit review
    - CSP rollout notes
17. Add database migration and live DB migration generation guidance.
18. Add documentation for known production blockers and deferred hardening work.
19. Add tests for any scripts/configs added where practical.
20. Update IMPLEMENTATION_STATUS.md.
21. Update plans/context.md.
22. Update plans/SESSION_LOG.md.
23. Create or update plans/phase-26-deployment-release-operations/review.md.

Deployment requirements:
1. Document supported deployment modes clearly.
2. Do not hardcode production secrets.
3. Do not commit real environment values.
4. .env.example must contain placeholders only.
5. Document required vs optional environment variables.
6. Document static build vs runtime secret validation behavior.
7. Keep env.ts split-schema behavior intact.
8. Do not eagerly validate runtime secrets during static build.
9. Document how to run:
   - pnpm install
   - pnpm lint
   - pnpm typecheck
   - pnpm test
   - pnpm build
   - payload generate:types if needed
   - migration commands
   - seed command if needed
10. Document expected health/readiness endpoints:
   - /api/health
   - /api/readiness

Release requirements:
1. Add a repeatable release checklist.
2. Include version/tag guidance if required.
3. Include changelog/release notes guidance if required.
4. Include database migration review.
5. Include backup-before-migration rule.
6. Include rollback decision points.
7. Include smoke test checklist.
8. Include security checklist.
9. Include dependency audit review.
10. Include OpenAPI validation.
11. Include marketplace/package dry-run validation.
12. Include MCP/webhook/security boundary checks.
13. Include multi-site isolation smoke checks.
14. Include member/admin auth smoke checks.
15. Include commerce disabled/misconfigured safe-state checks.

CI/CD requirements:
1. Add CI/CD foundation only if required by the Phase 26 plan.
2. Prefer documentation or safe workflow files that run existing checks.
3. Do not add deployment secrets to workflow files.
4. Do not deploy automatically to production unless the plan explicitly requires it.
5. Do not run destructive database commands automatically.
6. Do not run marketplace install/update execution.
7. Do not run package managers inside the app at runtime.
8. CI should run:
   - install
   - lint
   - typecheck
   - tests
   - build
   - package checks where practical
9. CI should not require live production secrets.
10. If using GitHub Actions or another CI, keep workflow generic and safe.

Container/hosting requirements:
1. Add Docker/container support only if required by the Phase 26 plan.
2. Do not include secrets in Dockerfile or image layers.
3. Use production-safe Node/pnpm install strategy if container is added.
4. Do not copy .env files into images.
5. Document runtime env injection.
6. Document persistent storage requirements for uploads if relevant.
7. Document database connection requirements.
8. Document Payload upload/media implications.
9. Document reverse proxy / trusted proxy implications for multi-site host resolution.
10. Document CSP/header considerations behind proxies/CDNs.

Database/migration requirements:
1. Document live DB migration generation and execution.
2. Document why prior phases may not have committed migration files.
3. Document backup-before-migration policy.
4. Document restore verification.
5. Document seed usage and production seed restrictions.
6. Do not automatically run destructive migrations.
7. Do not drop/reset production DB.
8. Document migration:fresh as dev-only if present.
9. Document Payload migration workflow clearly.
10. Document multi-site backfill/default site concerns.

Backup/recovery requirements:
1. Add backup/restore operational guidance.
2. Include database backup steps.
3. Include uploads/media backup notes.
4. Include environment secret backup/rotation notes without exposing values.
5. Include restore smoke test guidance.
6. Include rollback compatibility notes.
7. Do not implement unsafe backup endpoints unless Phase 26 explicitly requires a safe admin-only stub.
8. Do not expose backups publicly.

Observability/operations requirements:
1. Document structured logging usage.
2. Document correlation/request ID behavior.
3. Document safe error serialization.
4. Document readiness/health monitoring.
5. Document future provider integration points.
6. Document what not to log.
7. Document alerting recommendations if required.
8. Do not add external telemetry provider unless Phase 26 explicitly requires it.

Security operations requirements:
1. Document secret rotation procedure.
2. Document incident response checklist.
3. Document dependency audit triage.
4. Document CSP staged rollout and future nonce work.
5. Document rate-limit production adapter gap.
6. Document audit fail-open decision and future options.
7. Document marketplace supply-chain constraints.
8. Document MCP dangerous tools policy.
9. Document webhook secret rotation.
10. Document Medusa/commerce secrets handling.
11. Do not weaken Phase 25 hardening.

Marketplace/release artifact requirements:
1. Marketplace remains dry-run only.
2. Do not implement remote package install.
3. Do not implement auto-update execution.
4. Do not implement runtime code loading.
5. Release artifacts may include metadata/checklists only unless the plan explicitly requires safe scripts.
6. Do not generate or commit signing keys.
7. Do not include real signatures/secrets.
8. Document future signature verification/key distribution gap.

API/OpenAPI requirements:
1. Ensure OpenAPI generation/validation remains part of release checks if applicable.
2. Do not expose private endpoints as public platform APIs.
3. Do not include real secrets/examples.
4. Update OpenAPI only if Phase 26 adds endpoints.

MCP requirements:
1. Do not add dangerous MCP tools.
2. Do not add MCP deployment tools.
3. Do not expose deployment secrets via MCP.
4. Document MCP endpoint deployment security if required.
5. MCP must remain authenticated, scoped, and audited.

Payload/access-control requirements:
1. Prefer no Payload collection changes in Phase 26.
2. If collections are added, keep them hidden/protected.
3. Do not expose users, members, sites, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, webhook subscriptions, integration secrets, MCP state, analytics raw events, automation rules, marketplace/update metadata, admin data, tenant-private data, or system collections publicly.
4. Generate/update Payload types if collections change.
5. Add migrations only if live DB is available and the plan requires it; otherwise document the migration gap consistently.

Security requirements:
1. Do not commit secrets.
2. Do not print secrets in logs.
3. Do not add public endpoints exposing config.
4. Do not add auto-deploy with production secrets.
5. Do not add destructive commands to automated workflows.
6. Do not add runtime code execution.
7. Do not add dangerous MCP tools.
8. Do not add package install/update execution.
9. Do not add payments or new commerce capabilities.
10. Keep all previous security boundaries intact.
11. If new dependencies are added, justify them in the review.

Next.js requirements:
- Use App Router conventions if any endpoint is added.
- Use Route Handlers for new API endpoints only if required.
- Route Handlers must live inside the app directory.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/readiness, /api/forms/[formId]/public, /api/forms/[formId]/submit, /api/members/*, /api/commerce/*, /api/plugins/*, /api/templates/*, /api/webhooks/*, /api/mcp, /api/search, /api/analytics/summary, /api/marketplace/*, or API/OpenAPI routes.

Out of scope:
- Do not implement new product features.
- Do not implement new dashboard UX unless Phase 26 explicitly requires release/status placeholder only.
- Do not implement marketplace execution.
- Do not implement payment processing.
- Do not implement shipping/tax/coupon/inventory/refund features.
- Do not implement dangerous MCP tools.
- Do not implement remote plugin/package installation.
- Do not implement runtime code loading.
- Do not implement full managed hosting platform.
- Do not implement paid SaaS billing.
- Do not implement production secret storage service integration unless Phase 26 explicitly requires documentation only.
- Do not start Phase 27 or any later/unplanned phase.

Acceptance criteria:
- Deployment runbook exists.
- Production environment matrix exists.
- Release checklist exists.
- Rollback checklist exists.
- Backup/restore checklist exists.
- Migration execution checklist exists.
- Preflight and post-deploy verification checklists exist.
- CI/CD foundation exists if required by the plan.
- No secrets are committed.
- No destructive automation is added.
- No new product features are added.
- Existing API/webhook/MCP/search/analytics/automation/multisite/marketplace/security/public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms/commerce tests still pass.
- New tests cover any added scripts/configs where practical.
- .env.example is updated only with placeholders if Phase 26 adds required variables.
- Payload types are regenerated only if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 26 complete only.

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
- pnpm --dir packages/security lint
- pnpm --dir packages/security typecheck
- pnpm --dir packages/security test
- pnpm --dir packages/security build
- pnpm --dir packages/observability lint
- pnpm --dir packages/observability typecheck
- pnpm --dir packages/observability test
- pnpm --dir packages/observability build
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

If a deployment/release/ops package or scripts are added, also run their lint/typecheck/test/build checks if available.

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 26. Provide a review summary with:
- Files changed
- Packages added
- Deployment runbooks added
- Production environment matrix
- Release checklist
- Rollback checklist
- Backup/restore checklist
- Migration checklist
- CI/CD changes
- Container/hosting changes
- Health/readiness operations guidance
- Observability operations guidance
- Security operations guidance
- API/OpenAPI changes
- MCP changes, if any
- Payload collections added/changed
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps