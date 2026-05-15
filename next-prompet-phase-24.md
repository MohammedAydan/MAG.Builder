You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 24 only.

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

Current technical state:
- apps/web is a real Next.js 16 App Router app.
- Multi-site/SaaS readiness foundation exists from Phase 23.
- Hidden sites collection exists.
- Server-side site resolution exists.
- Site-aware filtering exists across content, forms, members, commerce, search, analytics, and automation.
- Optional proxy-trust flag was added to .env.example in Phase 23.
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
  - AnalyticsEventSchema with allowlisted events
  - AnalyticsService
  - hasSensitiveFields
  - NoopAnalyticsAdapter
- packages/automation exists and exports:
  - AutomationEngine
  - allowlisted triggers
  - allowlisted actions
  - AutomationRule schema
- Search API exists:
  - GET /api/search
- Analytics API exists:
  - GET /api/analytics/summary
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
  - no live-DB integration test for install/auth/audit/membership/commerce/webhooks/MCP/search/analytics/automation/multisite yet.
  - dashboard protection is helper-test level rather than full e2e route tests.
  - no interactive mobile dashboard sidebar.
  - protected/private media is out of scope.
  - no marketplace, packaging, or update foundation yet.

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
- 03-phases/README.md
- 03-phases/phase-24-marketplace-packaging-updates/plan.md
- 03-phases/phase-24-marketplace-packaging-updates/tasks.md
- 03-phases/phase-24-marketplace-packaging-updates/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-23-multisite-saas-readiness/review.md

Goal:
Complete Phase 24 — Marketplace, Packaging, and Updates only.

High-level purpose:
Build the first safe marketplace/packaging/update foundation for NexPress. This phase should define local package manifests, packaging metadata, update channel contracts, compatibility checks, artifact integrity verification, and safe installation/update planning. It must not implement remote arbitrary plugin execution, npm installs from the UI, marketplace payments, public marketplace publishing, auto-update execution, or arbitrary code loading.

Implementation requirements:
1. Implement Marketplace, Packaging, and Updates according to the Phase 24 plan.
2. Add package/marketplace manifest schema if required by the plan.
3. Add package registry/catalog foundation if required by the plan.
4. Add update channel metadata schema if required by the plan.
5. Add compatibility checks for platform version, package type, capabilities, dependencies, and conflicts.
6. Add package integrity metadata foundation:
   - checksums
   - signatures or signature placeholders if required
   - provenance metadata placeholders if required
7. Add SBOM/lockfile metadata foundation if required by the plan.
8. Add safe package discovery/listing foundation.
9. Add safe install/update plan generation foundation.
10. Add audit events for package install/update/enable/disable planning where appropriate.
11. Add docs/runbook for marketplace packaging and updates.
12. Add tests for manifest validation, unsafe package rejection, compatibility checks, integrity metadata validation, and update plan behavior.
13. Update API/OpenAPI docs only if new API endpoints are added.
14. Update MCP tools only if Phase 24 explicitly requires safe read-only marketplace/package status tools.
15. Update IMPLEMENTATION_STATUS.md.
16. Update plans/context.md.
17. Update plans/SESSION_LOG.md.
18. Create or update plans/phase-24-marketplace-packaging-updates/review.md.

Marketplace/packaging model requirements:
1. Package manifests must be versioned.
2. Package manifests must be typed and validated.
3. Package IDs must be stable, normalized, and collision-safe.
4. Package types must be allowlisted, for example:
   - plugin
   - theme
   - template
   - integration
   only if required by the plan.
5. Package manifests must declare compatible platform versions.
6. Package manifests must declare required capabilities.
7. Package manifests must declare dependencies and conflicts.
8. Package manifests must not contain executable scripts.
9. Package manifests must not contain shell commands.
10. Package manifests must not contain install scripts.
11. Package manifests must not contain arbitrary remote code URLs.
12. Package manifests must not contain secrets, tokens, passwords, DATABASE_URL, PAYLOAD_SECRET, MEDUSA secrets, webhook secrets, private runtime config, or real credentials.
13. Package manifests must not contain unsafe raw HTML or script markers.
14. Package metadata must support future marketplace UX but not implement full marketplace UI unless Phase 24 explicitly requires a minimal placeholder.

Update model requirements:
1. Update channels must be typed and allowlisted, for example stable/beta/dev only if required by the plan.
2. Update plans must be dry-run by default.
3. Update plans must not execute code.
4. Update plans must not modify files or database records unless Phase 24 explicitly requires a safe metadata-only state change.
5. Update plans must validate compatibility before suggesting updates.
6. Update plans must detect dependency conflicts.
7. Update plans must preserve tenant/site isolation where relevant.
8. Update plans must not bypass RBAC.
9. Update plans must be admin-capable only if exposed.
10. Update plans must be audited if persisted/executed as metadata.

Integrity/provenance requirements:
1. Package artifacts must include checksum metadata if artifacts are represented.
2. Checksum algorithms must be allowlisted.
3. Signature metadata must be represented if required by the plan.
4. Signature verification may be stubbed only if explicitly documented as a future hardening gap.
5. Provenance metadata placeholders should align with supply-chain best practices if required.
6. Do not trust unsigned/unverified artifacts as installable.
7. Do not execute packages even if integrity metadata validates.
8. Tests must cover invalid checksum/signature metadata rejection where practical.

Registry/catalog requirements:
1. Registry must be local/allowlisted in Phase 24.
2. Do not fetch package catalogs from arbitrary remote URLs.
3. Do not implement remote marketplace installation.
4. Do not implement npm install from UI.
5. Do not install packages at runtime.
6. Do not write arbitrary files.
7. Do not run package manager commands.
8. Do not dynamically import remote code.
9. Registry must expose safe read/list operations only unless Phase 24 explicitly requires admin-only plan generation.
10. Registry must hide sensitive metadata.

Admin/dashboard requirements:
1. Do not implement a full marketplace UI unless Phase 24 explicitly requires a tiny placeholder.
2. If a dashboard route is added, it must be server-side protected.
3. Admin UI must not expose secrets or raw package internals.
4. Package management must require admin-capable permissions.
5. Public members must not access marketplace management.
6. Tenant/site scoping must be respected if package state is site-specific.

Payload/access-control requirements:
1. Add Payload collections only if Phase 24 explicitly requires persisted package/update metadata.
2. If added, package/update collections must be hidden/protected.
3. Do not create public write access.
4. Do not expose users, members, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, webhook subscriptions, integration secrets, MCP state, analytics raw events, automation rules, admin data, tenant-private data, or system collections publicly.
5. Respect Payload collection access control.
6. Keep Local API usage server-only.
7. Use overrideAccess: false when operations should respect current-user permissions.
8. Document any overrideAccess: true usage and why it is safe.
9. Generate/update Payload types if collections are changed.
10. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Plugin/theme/template integration:
1. Package manifests must map safely to existing plugin/theme/template foundations.
2. Do not execute plugin code from manifests.
3. Do not allow package manifests to inject arbitrary builder blocks.
4. Do not allow package manifests to inject arbitrary React components.
5. Do not allow package manifests to change Payload config at runtime.
6. Do not allow package manifests to create users, roles, permissions, secrets, or system config.
7. Themes must remain token maps, not executable code.
8. Templates must still validate through @nexpress/themes and @nexpress/builder-core.
9. Plugins must remain local/allowlisted only.

Multi-site/SaaS requirements:
1. If package state is site-scoped, enforce site isolation.
2. If package state is global, document the decision.
3. Do not leak package state across tenants unless explicitly global and authorized.
4. Public site visitors must not access package management APIs.
5. Tenant/site context must be respected by any registry/status queries where applicable.

API/OpenAPI requirements:
1. Update OpenAPI only for new API endpoints.
2. Do not include real package signing keys, tokens, private URLs, or secrets in examples.
3. Admin-only package endpoints must be documented as admin-authenticated.
4. Public package catalog endpoints must expose safe metadata only, if any exist.
5. Add OpenAPI validation tests if paths are added.

MCP requirements:
1. Do not add MCP tools unless Phase 24 explicitly requires read-only package/marketplace status tools.
2. Any MCP tools added must be local, allowlisted, read-only, scoped, and audited.
3. MCP tools must not install packages, update packages, execute code, read files, write files, run shell commands, or fetch arbitrary URLs.
4. MCP tools must not expose secrets or tenant-private package state.

Security requirements:
1. Treat all package manifests and update metadata as untrusted input.
2. No arbitrary code execution.
3. No remote code loading.
4. No npm/pnpm/yarn install from UI or runtime.
5. No shell commands.
6. No eval, new Function, unsafe dynamic imports, or script injection.
7. No arbitrary filesystem writes.
8. No package manager execution.
9. No secrets in manifests, API responses, logs, audit metadata, OpenAPI examples, MCP responses, or public UI.
10. No public access to protected package/update metadata.
11. Validate manifests before any planning.
12. Use allowlisted package types, capabilities, channels, and checksum algorithms.
13. Fail closed on invalid compatibility, integrity, dependency, or conflict checks.
14. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin/forms/membership/commerce/API/webhook/MCP/search/analytics/automation/multisite protections.
15. Apply least privilege.
16. Minimize new dependencies.
17. If a new dependency is required, justify it in the review.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers for new API endpoints if any.
- Route Handlers must live inside the app directory.
- Route Handlers use Web Request and Response APIs.
- Keep Server Components as default outside route handlers.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime marketplace/package/update secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, /api/forms/[formId]/submit, /api/members/*, /api/commerce/*, /api/plugins/*, /api/templates/*, /api/webhooks/*, /api/mcp, /api/search, /api/analytics/summary, or API/OpenAPI routes.

Out of scope:
- Do not implement remote marketplace installation.
- Do not implement npm package installation.
- Do not implement auto-updates that modify files or database records.
- Do not implement runtime code loading.
- Do not implement executable plugin installation.
- Do not implement paid marketplace billing.
- Do not implement marketplace vendor accounts.
- Do not implement marketplace publishing flow.
- Do not implement app store review workflow.
- Do not implement package signing infrastructure beyond metadata/stubs required by the plan.
- Do not implement full update server.
- Do not implement production deployment hardening. That belongs to Phase 25/26.
- Do not implement dangerous MCP tools.
- Do not implement new commerce features.
- Do not start Phase 25.

Acceptance criteria:
- Package/marketplace manifest schema exists if required by the plan.
- Package registry/catalog foundation exists if required.
- Update channel/plan foundation exists if required.
- Compatibility checks exist.
- Integrity/provenance metadata foundation exists.
- Unsafe manifests are rejected.
- No code execution or package installation is implemented.
- Registry is local/allowlisted only.
- Admin/package management access is protected if endpoints/routes are added.
- Tenant/site isolation is respected where applicable.
- API/OpenAPI docs are updated only if new endpoints are added.
- Existing API/webhook/MCP/search/analytics/automation/multisite/public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms/commerce tests still pass.
- New tests cover manifest validation, unsafe rejection, compatibility checks, integrity metadata, dependency/conflict checks, and update plan behavior.
- .env.example is updated only with placeholders if Phase 24 adds required variables.
- Payload types are regenerated if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 24 complete only.
- No Phase 25 or later work is implemented.

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

If a new marketplace/packaging package is created, also run its lint/typecheck/test/build scripts.

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 24. Provide a review summary with:
- Files changed
- Packages added
- Marketplace/package module added
- Package manifest schema
- Registry/catalog foundation
- Update channel/plan foundation
- Compatibility checks
- Integrity/provenance metadata
- API/OpenAPI changes
- MCP changes, if any
- Payload collections added/changed
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps