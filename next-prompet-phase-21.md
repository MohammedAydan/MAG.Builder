You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 21 only.

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

Current technical state:
- apps/web is a real Next.js 16 App Router app.
- API platform and OpenAPI foundation exist from Phase 19.
- Webhooks/integrations foundation exists from Phase 20.
- Phase 20 fixed lint/typecheck issues in inbound/outbound webhook code.
- Phase 20 updated IMPLEMENTATION_STATUS.md, plans/context.md, plans/SESSION_LOG.md, and plans/phase-20-webhooks-integrations/review.md.
- Phase 20 introduced or updated packages/api and packages/webhooks according to the implementation.
- Inbound webhook route exists under apps/web/src/app/api/webhooks/inbound/route.ts.
- Outbound webhook service exists in the webhooks/integrations layer.
- API/OpenAPI docs were updated for webhook/integration endpoints.
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
  - tests and runbook/status updates
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
  - no live-DB integration test for install/auth/audit/membership/commerce/webhooks yet.
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
- any Phase 19 API/OpenAPI runbook/docs created in the repository
- any Phase 20 webhooks/integrations runbook/docs created in the repository
- 03-phases/README.md
- 03-phases/phase-21-mcp-native-gateway/plan.md
- 03-phases/phase-21-mcp-native-gateway/tasks.md
- 03-phases/phase-21-mcp-native-gateway/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-20-webhooks-integrations/review.md

Goal:
Complete Phase 21 — MCP Native Gateway only.

High-level purpose:
Build the first safe Model Context Protocol gateway foundation for NexPress. This phase should expose a carefully allowlisted MCP-compatible gateway over server-side APIs, define tool/resource/prompt registry contracts, enforce authentication/scopes/capability gates, provide safe JSON-RPC request handling, and document the gateway. It must not implement arbitrary tool execution, shell access, filesystem access, database raw queries, remote MCP marketplace installation, or broad automation.

Implementation requirements:
1. Implement MCP Native Gateway according to the Phase 21 plan.
2. Add an MCP gateway package or app module if required by the plan.
3. Add a typed MCP tool registry.
4. Add typed MCP resource registry if required by the plan.
5. Add typed MCP prompt registry if required by the plan.
6. Add JSON-RPC request/response validation according to the MCP-compatible gateway design.
7. Add MCP initialize/list-tools/call-tool foundation only as required by the plan.
8. Add MCP resources/list and resources/read foundation only if required by the plan.
9. Add MCP prompts/list and prompts/get foundation only if required by the plan.
10. Add a Next.js Route Handler endpoint for the MCP gateway only if required by the plan.
11. Keep all MCP execution server-side.
12. Require authentication for MCP gateway access unless the Phase 21 plan explicitly allows a public metadata-only endpoint.
13. Add scope/capability checks for every MCP tool.
14. Add audit entries for MCP tool calls and denied calls.
15. Add safe error handling that does not leak secrets or internal stack traces.
16. Add docs/runbook for MCP gateway setup, scopes, tools, limitations, and security posture.
17. Add tests for request validation, tool registry, scope enforcement, denied tool calls, safe errors, and audit behavior where practical.
18. Update OpenAPI/API docs only if Phase 21 exposes HTTP endpoints that should be documented by the API platform.
19. Update IMPLEMENTATION_STATUS.md.
20. Update plans/context.md.
21. Update plans/SESSION_LOG.md.
22. Create or update plans/phase-21-mcp-native-gateway/review.md.

MCP transport requirements:
1. Prefer a server-side Streamable HTTP style gateway only if Phase 21 requires a transport-level implementation.
2. Do not implement STDIO transport in the web app.
3. Do not spawn local processes.
4. Do not bind local MCP servers to 0.0.0.0.
5. Validate Origin headers for HTTP MCP endpoints where applicable.
6. Require authentication for HTTP MCP endpoints.
7. Use same-origin or explicit allowlist behavior for browser-origin access.
8. Do not enable broad CORS for MCP endpoints unless Phase 21 explicitly requires it and it is safe.
9. Keep request and response size limits.
10. Use safe timeouts for tool execution if applicable.

MCP authentication and authorization requirements:
1. MCP gateway must require server-side authentication.
2. Support explicit scopes/capabilities for tools.
3. Scopes must be typed and centrally defined.
4. Scopes must fail closed.
5. Tool calls must check user identity and scopes server-side.
6. Tool calls must also check existing app permissions where relevant:
   - admin/dashboard permissions for admin tools
   - member permissions for member tools
   - plugin capability checks for plugin-gated tools
   - commerce-pack capability checks for commerce tools
7. Public members must not gain admin/dashboard capabilities.
8. Admin users must not bypass tool-specific scopes.
9. Do not rely on client-side hiding for authorization.
10. Do not expose tokens or session secrets to MCP responses.

MCP tool registry requirements:
1. Tool definitions must be local and allowlisted only.
2. Do not load tools from remote URLs.
3. Do not allow user-uploaded tools.
4. Do not execute arbitrary tool code.
5. Do not eval tool descriptions or schemas.
6. Do not use new Function.
7. Do not execute shell commands.
8. Do not read arbitrary filesystem paths.
9. Do not write arbitrary filesystem paths.
10. Do not run package managers or install dependencies.
11. Do not expose raw database query tools.
12. Do not expose raw Payload Local API access as a generic tool.
13. Do not expose raw Medusa/provider access as a generic tool.
14. Tool input schemas must be strict and typed.
15. Tool outputs must be safe projections only.
16. Tool descriptions must be static, reviewed, and not user-controlled.
17. Tool registry must reject duplicate tool IDs.
18. Tool registry must validate tool capability requirements.
19. Tool calls must be audited.
20. Tool registry tests must cover safe registration, duplicate rejection, and invalid tool rejection.

Allowed initial MCP tools:
Implement only the minimal tools required by Phase 21. Safe candidates may include read-only/status tools such as:
- platform.health.read
- platform.openapi.read
- content.published.list
- plugins.available.list
- commerce.status.read
- webhooks.events.list

Do not implement all of these unless the Phase 21 plan requires them. Prefer read-only tools first.

Dangerous tools explicitly forbidden in Phase 21:
- shell.exec
- filesystem.read
- filesystem.write
- database.query
- payload.local.raw
- medusa.raw
- env.read
- secrets.read
- user.impersonate
- plugin.install.remote
- package.install
- code.eval
- webhook.send.arbitrary
- http.fetch.arbitrary
- payment.charge
- checkout.complete
- admin.role.grant

MCP resource requirements:
1. Resources must expose safe public or authorized metadata only.
2. Do not expose raw private collection documents.
3. Do not expose users, members, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, webhook secrets, integration secrets, admin data, or system records through resources.
4. Resources must enforce auth/scope checks server-side.
5. Resource URIs must be normalized and allowlisted.
6. Do not implement arbitrary URL/resource fetching.

MCP prompt requirements:
1. Prompts must be local and allowlisted only.
2. Prompts must not contain secrets.
3. Prompts must not include private data by default.
4. Prompts must not include tool-injection language instructing the model to bypass policies.
5. Prompt arguments must be validated.
6. Do not allow user-provided prompt templates to execute or inject system-level instructions.

MCP request validation requirements:
1. Validate JSON-RPC request shape.
2. Validate method names against an allowlist.
3. Validate params schemas strictly.
4. Reject batch requests unless Phase 21 explicitly supports them safely.
5. Reject unknown methods.
6. Reject oversized requests.
7. Return consistent JSON-RPC errors without leaking stack traces.
8. Do not echo sensitive input values in errors.
9. Add tests for invalid JSON, unknown method, invalid params, unauthorized, forbidden, and successful read-only tool calls.

Tool execution requirements:
1. All tool execution must happen server-side.
2. Tool execution must be bounded and deterministic where possible.
3. Tool execution must not mutate state unless Phase 21 explicitly requires a safe audited mutation.
4. Mutating MCP tools should be out of scope for Phase 21 unless the plan explicitly requires one.
5. Read-only tools are preferred.
6. Tool outputs must not include secrets, raw configs, tokens, private URLs, or raw provider responses.
7. Tool outputs must not expose draft content, members-only content to unauthorized users, or private admin data.
8. Tool errors must be safe and generic.
9. Tool calls must be audited with safe metadata:
   - actor id/type if available
   - tool id
   - status
   - timestamp
   - request id
   - safe result metadata only
10. Audit metadata must not include raw secrets, tokens, env values, full prompt content, or sensitive payloads.

Plugin/capability integration:
1. MCP gateway may be gated behind an mcp or integration capability if the plan requires it.
2. Capability checks must fail closed.
3. Do not execute plugin code from manifests.
4. Do not allow plugins to register arbitrary executable MCP tools in Phase 21.
5. Future plugin-provided tools may be represented as metadata only if required by the plan.
6. Do not implement MCP marketplace or remote tool installation.

API/OpenAPI integration:
1. Update API/OpenAPI docs for MCP endpoint only if Phase 21 requires it.
2. Do not include bearer tokens, session cookies, secrets, or private URLs in OpenAPI examples.
3. Mark MCP endpoint auth requirements clearly.
4. Mark MCP endpoint as JSON-RPC style if documented.
5. Do not expose tool internals beyond safe schemas/descriptions.

Payload/access-control requirements:
1. If new Payload collections are added, keep them hidden/protected.
2. MCP tool calls/audit state must not be publicly readable.
3. Do not expose users, members, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, webhook subscriptions, integration secrets, admin data, or system collections publicly.
4. Respect Payload collection access control.
5. Keep Local API usage server-only.
6. Use overrideAccess: false when operations should respect current-user permissions.
7. Document any overrideAccess: true usage and why it is safe.
8. Generate/update Payload types if collections are changed.
9. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Security requirements:
1. Treat all MCP requests as untrusted input.
2. No secrets in MCP responses.
3. No raw runtime config in MCP responses.
4. No env-reading MCP tools.
5. No raw database tools.
6. No shell tools.
7. No arbitrary filesystem tools.
8. No arbitrary HTTP fetch tools.
9. No remote code loading.
10. No eval, new Function, dynamic script execution, or unsafe dynamic imports.
11. No user-uploaded MCP servers or tools.
12. No broad CORS.
13. Validate Origin headers where applicable.
14. Require authentication and scopes.
15. Enforce least privilege for every tool.
16. Audit tool calls and denied calls.
17. Do not log secrets, tokens, private configs, raw prompts, raw provider responses, or sensitive payloads.
18. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin/forms/membership/commerce/API/webhook protections.
19. Public bundle must not include MCP admin/provider-secret code.
20. If a new dependency is required, justify it in the review.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers for MCP endpoint if implemented.
- Route Handlers must live inside the app directory.
- Route Handlers use Web Request and Response APIs.
- Keep Server Components as default outside route handlers.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime MCP secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, /api/forms/[formId]/submit, /api/members/*, /api/commerce/*, /api/plugins/*, /api/templates/*, /api/webhooks/*, or API/OpenAPI routes.

Out of scope:
- Do not implement MCP marketplace.
- Do not implement remote MCP server installation.
- Do not implement STDIO transport.
- Do not spawn processes.
- Do not implement shell/filesystem/database/raw HTTP tools.
- Do not implement arbitrary user-defined tools.
- Do not implement plugin-provided executable tools.
- Do not implement full AI automation workflows. That belongs to Phase 22.
- Do not implement payment, checkout completion, shipping, taxes, coupons, inventory, refunds, or marketplace/vendor features.
- Do not implement new builder blocks.
- Do not implement new commerce features.
- Do not start Phase 22.

Acceptance criteria:
- MCP gateway foundation exists according to Phase 21 plan.
- MCP tool registry exists.
- Tool definitions are local, typed, and allowlisted.
- Tool scopes/capabilities are enforced server-side.
- JSON-RPC request validation exists if MCP endpoint is implemented.
- MCP endpoint requires authentication unless the plan explicitly allows metadata-only public access.
- Origin/CORS handling is safe for HTTP transport.
- Dangerous tools are not implemented.
- Tool calls and denied calls are audited.
- Tool outputs expose only safe projections.
- MCP errors do not leak secrets or stack traces.
- API/OpenAPI docs are updated only if required.
- Existing API/webhook/public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms/commerce tests still pass.
- New tests cover registry, request validation, authorization/scopes, safe tool output, denied tools, and safe error handling.
- .env.example is updated only with placeholders if Phase 21 adds required variables.
- Payload types are regenerated if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 21 complete only.
- No Phase 22 or later work is implemented.

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

Also run checks for packages/api and packages/webhooks if they exist:
- pnpm --dir packages/api lint
- pnpm --dir packages/api typecheck
- pnpm --dir packages/api test
- pnpm --dir packages/api build
- pnpm --dir packages/webhooks lint
- pnpm --dir packages/webhooks typecheck
- pnpm --dir packages/webhooks test
- pnpm --dir packages/webhooks build

If a new MCP package is created, also run its lint/typecheck/test/build scripts.

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 21. Provide a review summary with:
- Files changed
- Packages added
- MCP package/module added
- MCP endpoint/transport added
- Tool registry added
- Resource registry added
- Prompt registry added
- Auth/scopes/capability model
- Tool list implemented
- Tool calls implemented
- Dangerous tools explicitly not implemented
- API/OpenAPI changes
- Payload collections added/changed
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps