You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 22 only.

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

Current technical state:
- apps/web is a real Next.js 16 App Router app.
- API platform and OpenAPI foundation exist from Phase 19.
- Webhooks/integrations foundation exists from Phase 20.
- MCP gateway foundation exists from Phase 21.
- @nexpress/mcp-gateway package exists and isolates JSON-RPC routing, tool registry, and scope handling.
- MCP endpoint exists at apps/web/src/app/api/mcp/route.ts.
- MCP gateway uses HTTP route handling and existing Payload session mechanisms.
- MCP scope model resolves scopes from Payload core roles.
- MCP tool calls are server-side authenticated and authorized.
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
- MCP audit action exists:
  - system.mcp.tool_called
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
- Design tokens exist under apps/web/src/lib/design-system/tokens.ts.
- Public shell components exist under apps/web/src/components/public.
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
- packages/mcp-gateway owns MCP JSON-RPC/tool/scope logic if created in Phase 21.
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
  - no live-DB integration test for install/auth/audit/membership/commerce/webhooks/MCP yet.
  - dashboard protection is helper-test level rather than full e2e route tests.
  - no interactive mobile dashboard sidebar.
  - protected/private media is out of scope.
  - no search, analytics, or automation foundation yet.

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
- 03-phases/README.md
- 03-phases/phase-22-search-analytics-automation/plan.md
- 03-phases/phase-22-search-analytics-automation/tasks.md
- 03-phases/phase-22-search-analytics-automation/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-21-mcp-native-gateway/review.md

Goal:
Complete Phase 22 — Search, Analytics, and Automation only.

High-level purpose:
Build the first safe search, analytics, and automation foundation for NexPress. This phase should add searchable content indexing contracts, query helpers, analytics event tracking foundations, privacy-safe aggregation primitives, and a limited automation rules foundation. It must not implement autonomous agents, arbitrary code execution, raw database querying, arbitrary HTTP fetch automation, payment automation, or MCP tool expansion beyond safe read-only additions explicitly required by the plan.

Implementation requirements:
1. Implement Search, Analytics, and Automation according to the Phase 22 plan.
2. Add a search package/module if required by the plan.
3. Add searchable document/index contracts.
4. Add search indexing helpers for published public content only, unless the plan explicitly requires admin-only indexes.
5. Add search query helpers with safe filters and pagination.
6. Add a search API route only if required by the plan.
7. Add an analytics package/module if required by the plan.
8. Add typed analytics event schema.
9. Add analytics collection/storage only if required by the plan.
10. Add privacy-safe event capture helpers.
11. Add aggregation/reporting helper foundation only if required by the plan.
12. Add an automation package/module if required by the plan.
13. Add automation rule schema and allowlisted trigger/action registry.
14. Add automation execution service foundation.
15. Add audit entries for automation rule changes and execution where appropriate.
16. Add docs/runbook for search, analytics, and automation behavior.
17. Update OpenAPI/API docs only for newly exposed API endpoints.
18. Update MCP tools only if Phase 22 explicitly requires safe read-only tools, and keep them scoped/audited.
19. Update IMPLEMENTATION_STATUS.md.
20. Update plans/context.md.
21. Update plans/SESSION_LOG.md.
22. Create or update plans/phase-22-search-analytics-automation/review.md.

Search requirements:
1. Search must only expose published public content to anonymous users.
2. Members-only content must require member authorization.
3. Draft content must not be searchable publicly.
4. Search indexes must not include secrets, private config, raw webhook payloads, private member data, audit logs, form submissions, commerce customers/orders, plugin states, installation state, or admin data.
5. Search results must be safe projections only.
6. Search query inputs must be validated and length-limited.
7. Search pagination must be bounded.
8. Search filters must be allowlisted.
9. Search must fail safely when index/storage is unavailable.
10. Do not implement raw SQL/full database query endpoints.
11. If using in-memory/local search in Phase 22, document production limitations.
12. If using external search provider integration, keep secrets server-only and document the provider, but do not add paid dependency unless the plan explicitly requires it.

Analytics requirements:
1. Analytics events must be typed and versioned.
2. Analytics event names must be stable and allowlisted.
3. Analytics capture must not store secrets, passwords, tokens, raw config, raw provider responses, webhook secrets, full form submission payloads, card data, payment data, or private member/admin data.
4. Avoid collecting unnecessary PII.
5. IP addresses must be minimized, hashed, truncated, or omitted unless the plan explicitly requires them.
6. User agents/referrers must be sanitized and length-limited if collected.
7. Analytics capture must validate event payloads server-side.
8. Analytics APIs must not expose raw event streams publicly.
9. Aggregations must be safe and permission-gated.
10. Analytics should not weaken existing audit logs.
11. Audit logs and analytics must remain conceptually separate.
12. Add tests for event validation and sensitive-field rejection.

Automation requirements:
1. Automation rules must be typed and allowlisted.
2. Automation triggers must be explicit and safe.
3. Automation actions must be explicit and safe.
4. Do not allow arbitrary user-written code.
5. Do not allow eval, new Function, shell commands, raw database queries, arbitrary HTTP fetch, arbitrary webhooks, filesystem access, or package installation.
6. Automation actions must not bypass RBAC.
7. Automation actions must be server-side only.
8. Automation rules must be admin-capable only if persisted/configurable.
9. Automation execution must validate trigger payloads and action config.
10. Automation execution must produce safe result metadata.
11. Automation failures must not leak secrets.
12. Automation must be audited where appropriate.
13. If automation is synchronous/in-process only, document production queue/scheduler limitations.
14. Do not implement full workflow designer UI unless Phase 22 explicitly requires a minimal placeholder.
15. Do not implement autonomous AI agents.

Allowed automation examples:
Implement only what the Phase 22 plan requires. Safe candidates may include:
- on form submitted -> emit analytics event
- on content published -> enqueue search reindex metadata
- on commerce order snapshot created -> emit analytics event
- scheduled placeholder contract only, without real scheduler, if required

Forbidden automation actions in Phase 22:
- shell.exec
- database.query
- filesystem.read
- filesystem.write
- http.fetch.arbitrary
- webhook.send.arbitrary
- payment.charge
- checkout.complete
- admin.role.grant
- user.impersonate
- plugin.install.remote
- package.install
- env.read
- secrets.read
- code.eval

MCP integration requirements:
1. Do not expand MCP with dangerous tools.
2. Add MCP read-only search/analytics status tools only if Phase 22 explicitly requires them.
3. MCP tools must remain local, allowlisted, scoped, audited, and read-only unless explicitly required otherwise.
4. MCP tools must not expose raw analytics events, private search indexes, private content, or sensitive data.
5. Do not implement automation execution through MCP unless Phase 22 explicitly requires a safe read-only/status tool.

API/OpenAPI requirements:
1. Update OpenAPI only for new API endpoints.
2. Do not document secrets, tokens, private URLs, real user emails, API keys, webhook secrets, or private configs in examples.
3. Search API must document safe public/member auth behavior.
4. Analytics APIs must document admin-only requirements if exposed.
5. Automation APIs must document admin-only requirements if exposed.
6. Add OpenAPI validation tests if paths are added.

Payload/access-control requirements:
1. If new Payload collections are added, keep them protected appropriately.
2. Search index collections must not expose private data publicly.
3. Analytics event collections must not be publicly readable.
4. Automation rules/executions must not be publicly readable or writable.
5. Do not expose users, members, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, webhook subscriptions, integration secrets, MCP state, admin data, or system collections publicly.
6. Respect Payload collection access control.
7. Keep Local API usage server-only.
8. Use overrideAccess: false when operations should respect current-user permissions.
9. Document any overrideAccess: true usage and why it is safe.
10. Generate/update Payload types if collections are changed.
11. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Security requirements:
1. Treat all search queries, analytics events, and automation triggers as untrusted input.
2. No secrets in search index, analytics events, automation configs, API responses, logs, audit metadata, MCP responses, or OpenAPI examples.
3. No raw runtime config exposed to public UI.
4. No arbitrary code execution.
5. No shell tools.
6. No raw database query tools.
7. No arbitrary filesystem access.
8. No arbitrary HTTP fetch automation.
9. No remote code loading.
10. No eval, new Function, dynamic script execution, or unsafe dynamic imports.
11. Validate and bound all input.
12. Enforce server-side authorization.
13. Apply least privilege to search, analytics, and automation operations.
14. Do not log sensitive payloads.
15. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin/forms/membership/commerce/API/webhook/MCP protections.
16. Client-side hiding is not a security boundary.
17. If a new dependency is required, justify it in the review.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers for new API endpoints.
- Route Handlers must live inside the app directory.
- Route Handlers use Web Request and Response APIs.
- Keep Server Components as default outside route handlers.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime search/analytics/automation secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, /api/forms/[formId]/submit, /api/members/*, /api/commerce/*, /api/plugins/*, /api/templates/*, /api/webhooks/*, /api/mcp, or API/OpenAPI routes.

Out of scope:
- Do not implement full observability/security hardening. That belongs to Phase 25.
- Do not implement autonomous AI agents.
- Do not implement arbitrary automation actions.
- Do not implement arbitrary HTTP fetch automation.
- Do not implement full marketing automation platform.
- Do not implement email provider integration unless Phase 22 explicitly requires analytics/automation stubs only.
- Do not implement payment, checkout completion, shipping, taxes, coupons, inventory, refunds, or marketplace/vendor features.
- Do not implement new commerce features.
- Do not implement new builder blocks unless Phase 22 explicitly requires a search block placeholder.
- Do not implement MCP dangerous tools.
- Do not start Phase 23.

Acceptance criteria:
- Search foundation exists according to Phase 22 plan.
- Search indexes/queries expose only authorized safe projections.
- Analytics event schema/capture foundation exists according to Phase 22 plan.
- Analytics avoids sensitive data and unnecessary PII.
- Automation rule/trigger/action foundation exists according to Phase 22 plan.
- Automation actions are allowlisted and safe.
- No arbitrary code execution or arbitrary HTTP/database/filesystem operations are added.
- API/OpenAPI docs are updated only if new endpoints are added.
- Existing API/webhook/MCP/public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms/commerce tests still pass.
- New tests cover search query validation, access filtering, analytics event validation, sensitive-field rejection, automation trigger/action validation, denied unsafe actions, and safe execution behavior where practical.
- .env.example is updated only with placeholders if Phase 22 adds required variables.
- Payload types are regenerated if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 22 complete only.
- No Phase 23 or later work is implemented.

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

Also run checks for packages/api, packages/webhooks, and packages/mcp-gateway if they exist:
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

If new search/analytics/automation packages are created, also run their lint/typecheck/test/build scripts.

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 22. Provide a review summary with:
- Files changed
- Packages added
- Search package/module added
- Search indexes/query behavior
- Analytics package/module added
- Analytics event schema/capture behavior
- Automation package/module added
- Automation triggers/actions implemented
- API/OpenAPI changes
- MCP changes, if any
- Payload collections added/changed
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps