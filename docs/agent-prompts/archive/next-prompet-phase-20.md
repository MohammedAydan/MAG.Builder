You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 20 only.

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

Current technical state:
- apps/web is a real Next.js 16 App Router app.
- Custom API platform and OpenAPI foundation exist from Phase 19.
- OpenAPI documentation is based on OpenAPI 3.1.x.
- OpenAPI must continue to document safe API contracts only.
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
- packages/builder-editor exists and integrates Puck as editor-only adapter.
- Puck is not the public renderer.
- packages/themes exists and owns theme/template foundations.
- packages/plugins exists and owns plugin/module foundations.
- packages/forms exists and owns forms/workflow foundations.
- packages/commerce exists and owns commerce contracts/provider adapter.
- Provider strategy:
  - Medusa is the selected first commerce provider.
  - Medusa remains behind a server-side adapter boundary in NexPress.
  - Public/client code must not depend directly on Medusa internals.
- Commerce service is gated through commerce-pack and fails closed when disabled/misconfigured.
- Storefront commerce blocks exist from Phase 18.
- Form webhooks exist only as Phase 14 workflow action foundation with SSRF protections.
- Current known gaps:
  - no live DB migration files for recent Payload collection additions because migration generation requires a live database.
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
  - Puck is behind latest/upstream-deprecated but the builder kernel remains vendor-neutral.
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
- any Phase 19 API/OpenAPI runbook/docs created in the repository
- 03-phases/README.md
- 03-phases/phase-20-webhooks-integrations/plan.md
- 03-phases/phase-20-webhooks-integrations/tasks.md
- 03-phases/phase-20-webhooks-integrations/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-19-api-platform-openapi/review.md

Goal:
Complete Phase 20 — Webhooks and Integrations only.

High-level purpose:
Build the first safe webhooks and integrations foundation for NexPress. This phase should add a typed event registry, outbound webhook subscription/delivery foundation, inbound webhook verification foundation, integration registry, signature verification, retry/delivery attempt metadata, and OpenAPI/API docs updates. It must not implement MCP, full automation, third-party marketplace integrations, payment provider flows, shipping/tax integrations, or arbitrary integration code execution.

Implementation requirements:
1. Implement Webhooks and Integrations according to the Phase 20 plan.
2. Add a typed event registry for platform events.
3. Add a webhook subscription model/collection if required by the plan.
4. Add a webhook delivery attempt model/collection if required by the plan.
5. Add outbound webhook delivery service foundation.
6. Add inbound webhook endpoint verification foundation if required by the plan.
7. Add integration registry foundation if required by the plan.
8. Add integration configuration validation without exposing secrets.
9. Add signature generation/verification utilities.
10. Add timestamp/nonce/replay protection foundation where required.
11. Add retry/backoff policy metadata where required.
12. Add safe delivery payload schemas.
13. Add tests for event registry, payload schemas, signature verification, replay prevention, delivery attempts, SSRF-safe URL validation, and access control where practical.
14. Update OpenAPI/API docs from Phase 19 for new routes/contracts.
15. Update docs/runbook for webhooks and integrations.
16. Update IMPLEMENTATION_STATUS.md.
17. Update plans/context.md.
18. Update plans/SESSION_LOG.md.
19. Create or update plans/phase-20-webhooks-integrations/review.md.

Event registry requirements:
1. Events must be typed, versioned, and documented.
2. Events must use stable event names.
3. Event payloads must be safe public/integration payloads, not raw database records.
4. Event payloads must not include secrets, tokens, passwords, DATABASE_URL, PAYLOAD_SECRET, MEDUSA secrets, webhook secrets, private config, raw provider responses, or sensitive member/admin data.
5. Event payload schemas must be deterministic and testable.
6. Event registry must not execute arbitrary code.
7. Event registry must support future plugin-defined events only as safe metadata if Phase 20 requires it; do not execute plugin code from manifests.

Outbound webhook requirements:
1. Webhook subscriptions must be admin-capable only.
2. Public users and members must not create arbitrary webhook subscriptions.
3. Webhook target URLs must be validated server-side.
4. Webhook targets must use HTTPS in production.
5. Reject localhost, private IP ranges, link-local ranges, cloud metadata service IPs, file URLs, javascript URLs, data URLs, and unsupported schemes.
6. Limit redirects or disable redirects to avoid SSRF bypasses.
7. Use request timeouts.
8. Limit payload size.
9. Sign outbound webhook payloads with a per-subscription secret or server-generated secret if required by the plan.
10. Do not log webhook secrets or full sensitive payloads.
11. Store delivery attempts with safe metadata only.
12. Do not store raw secret headers.
13. Do not expose raw external responses to clients.
14. Delivery failures must fail safely and not crash unrelated request flows.
15. If delivery is synchronous in Phase 20, document limitations and future queue requirement.
16. If delivery is queued/stubbed in Phase 20, document queue gap clearly.
17. Add tests for unsafe URL rejection and safe URL acceptance.

Inbound webhook requirements:
1. Inbound webhook endpoints must verify signatures when a provider secret is configured.
2. Inbound webhook verification must preserve raw body if signature algorithm requires it.
3. Verify timestamp and reject stale requests to reduce replay risk.
4. Add nonce/event-id replay tracking foundation if required by the plan.
5. Reject unsupported providers/events.
6. Do not trust provider payloads without validation.
7. Do not expose internal errors in responses.
8. Do not process payment/shipping/tax provider flows unless Phase 20 explicitly requires safe placeholder verification only.
9. Add tests for valid signature, invalid signature, stale timestamp, replay attempt, and invalid payload where practical.

Integration registry requirements:
1. Integrations must be typed and allowlisted.
2. Do not load integrations from remote URLs.
3. Do not execute arbitrary uploaded integration code.
4. Do not eval integration code.
5. Do not use new Function.
6. Do not allow integration manifests to contain executable scripts.
7. Integration configuration must validate safe fields only.
8. Integration secrets must be server-only and never returned by APIs.
9. Integration registry must not import public-unsafe code into public routes.
10. Integration activation/deactivation must be admin-capable only if implemented.
11. Integration changes should be audited where practical.

Payload/access-control requirements:
1. If new Payload collections are added, keep them hidden/protected.
2. Webhook subscriptions must not be publicly readable or writable.
3. Delivery attempts must not be publicly readable.
4. Integration secrets must not be publicly readable.
5. Do not expose users, members, audit logs, installation-state, plugin-states, form-submissions, commerce-customers, commerce-orders, admin data, or system collections publicly.
6. Respect Payload collection access control.
7. Keep Local API usage server-only.
8. Use overrideAccess: false when operations should respect current-user permissions.
9. Document any overrideAccess: true usage and why it is safe.
10. Generate/update Payload types if collections are changed.
11. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Security requirements:
1. Treat all webhook/integration input as untrusted.
2. No secrets in client components.
3. No raw runtime config exposed to public UI.
4. No webhook secrets in API responses, logs, OpenAPI examples, audit metadata, or delivery attempt public views.
5. No arbitrary code execution.
6. No remote code loading.
7. No eval, new Function, unsafe dynamic imports, or script injection.
8. Protect outbound webhooks from SSRF.
9. Protect inbound webhooks from signature bypass and replay attacks.
10. Do not expose raw external responses to clients.
11. Do not log full sensitive payloads.
12. Validate event payloads before delivery.
13. Validate inbound payloads before processing.
14. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin/forms/membership/commerce/API protections.
15. Client-side hiding is not a security boundary.
16. Be mindful of supply-chain risk; do not add unnecessary packages.
17. If a new dependency is required, justify it in the review.

API/OpenAPI requirements:
1. Update the Phase 19 OpenAPI document for new webhook/integration endpoints if any.
2. Do not include real webhook secrets, tokens, private URLs, passwords, or provider secrets in examples.
3. Mark admin-only webhook management endpoints as requiring admin auth.
4. Mark inbound provider webhook endpoints separately if they are public but signature-protected.
5. Document safe response/error envelopes.
6. Add OpenAPI validation tests for new paths/schemas where practical.

Commerce/forms/plugin integration requirements:
1. Webhook events may include safe commerce/form/plugin event payloads only if required by Phase 20.
2. Do not implement payment provider webhooks beyond safe verification placeholder unless Phase 20 explicitly requires it.
3. Do not implement Medusa webhook reconciliation unless Phase 20 explicitly requires a small placeholder.
4. Do not expose form submission details publicly.
5. Do not expose commerce order/customer internals publicly.
6. Plugin/integration events must not execute plugin code from manifests.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers for webhook/integration endpoints.
- Route Handlers must live inside the app directory.
- Route Handlers use Web Request and Response APIs.
- Keep Server Components as default outside route handlers.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime integration/webhook secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /login, /signup, /account, /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, /api/forms/[formId]/submit, /api/members/*, /api/commerce/*, /api/plugins/*, /api/templates/*, or API/OpenAPI routes from Phase 19.

Out of scope:
- Do not implement MCP. That belongs to Phase 21.
- Do not implement analytics/automation. That belongs to Phase 22.
- Do not implement payment processing.
- Do not implement shipping/tax/coupon/inventory provider integrations.
- Do not implement marketplace integrations.
- Do not implement remote integration installation.
- Do not execute third-party integration code.
- Do not implement background queue infrastructure unless Phase 20 explicitly requires a stub/interface.
- Do not implement full dashboard UI unless Phase 20 explicitly requires minimal management placeholders.
- Do not implement new commerce features.
- Do not implement new builder blocks.
- Do not start Phase 21.

Acceptance criteria:
- Event registry exists.
- Webhook/integration foundation exists according to Phase 20 plan.
- Webhook subscriptions/delivery attempts are protected if collections are added.
- Outbound webhook URL validation protects against SSRF.
- Webhook payload signing/verification utilities exist where required.
- Replay protection foundation exists where required.
- Integration registry/config validation exists where required.
- Delivery attempt metadata stores safe information only.
- Secrets are never exposed in client components, API responses, OpenAPI examples, logs, or audit metadata.
- OpenAPI/API docs are updated for new endpoints if any.
- Existing API platform tests still pass.
- Existing public/member/admin/dashboard/content/builder/editor/theme/template/plugin/forms/commerce tests still pass.
- New tests cover event registry, payload schemas, signature verification, replay prevention, URL validation, delivery attempts, and access control where practical.
- .env.example is updated only with placeholders if Phase 20 adds required variables.
- Payload types are regenerated if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 20 complete only.
- No Phase 21 or later work is implemented.

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

If a new webhooks/integrations package is created, also run its lint/typecheck/test/build scripts.

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 20. Provide a review summary with:
- Files changed
- Packages added
- Webhook/integration package or modules added
- Event registry added
- Payload collections added/changed
- Outbound webhook delivery foundation
- Inbound webhook verification foundation
- Signature/replay protection
- Integration registry/config validation
- API/OpenAPI changes
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps