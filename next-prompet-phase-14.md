You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 14 only.

Current completed state:
- Phase 00 completed the monorepo/bootstrap scaffold.
- Phase 01 completed product governance, v1 scope freeze, and architecture constraints.
- Phase 02 completed the Next.js 16 platform foundation in apps/web.
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

Current technical state:
- apps/web is a real Next.js 16 App Router app.
- Public route / renders through apps/web/src/app/(public)/page.tsx.
- Dynamic public page route exists at apps/web/src/app/(public)/[slug]/page.tsx.
- Dynamic public post route exists at apps/web/src/app/(public)/journal/[slug]/page.tsx.
- robots.txt and sitemap.xml routes exist.
- Payload is installed and integrated inside apps/web.
- Payload admin route exists at /admin/[[...segments]].
- Payload API route exists at /api/[...slug].
- Health route exists at /api/health.
- Install route exists at /install.
- Install API exists at /api/install.
- Project-owned dashboard route exists at /dashboard.
- Dashboard settings route exists at /dashboard/settings.
- Dashboard pages list exists at /dashboard/pages.
- Visual builder route exists at /dashboard/pages/[id]/builder.
- Builder save route exists at /dashboard/pages/[id]/builder/save.
- Draft preview route exists at /dashboard/pages/[id]/preview.
- Dashboard/editor access is protected server-side.
- typed env validation exists at apps/web/src/lib/env.ts.
- env.ts uses a split-schema pattern:
  - buildEnv validates only build-safe variables at module load.
  - getRuntimeEnv() lazily validates runtime secrets inside handlers/scripts.
  - env Proxy preserves backwards-compatible access.
- Roles implemented:
  - super-admin
  - admin
  - editor
- Permission helpers exist under apps/web/src/lib/auth.
- Dashboard helpers exist under apps/web/src/lib/dashboard.
- Audit helpers exist under apps/web/src/lib/audit.
- Content helpers exist under apps/web/src/lib/content.
- Template helpers exist under apps/web/src/lib/templates.
- Plugin helpers/services exist under apps/web/src/lib/plugins.
- Design tokens exist under apps/web/src/lib/design-system/tokens.ts.
- Public shell components exist under apps/web/src/components/public.
- Payload collections currently include:
  - users
  - installation-state
  - audit-logs
  - media
  - pages
  - posts
  - redirects
  - plugin-states
- pages and posts use Payload drafts via _status.
- Anonymous/public reads only resolve _status = published.
- Public content queries use overrideAccess: false.
- Media is public-read by design for public-safe assets.
- Alt text is required on media.
- SEO fields exist.
- Payload types exist at apps/web/src/payload-types.ts.
- Builder kernel exists in packages/builder-core.
- apps/web depends on @nexpress/builder-core.
- @nexpress/builder-core owns:
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
- packages/builder-editor exists.
- apps/web depends on @nexpress/builder-editor.
- @nexpress/builder-editor integrates @measured/puck@0.20.2 as editor-only adapter.
- Puck is not the public renderer.
- Public pages still render through @nexpress/builder-core.
- packages/themes exists.
- apps/web depends on @nexpress/themes.
- @nexpress/themes owns:
  - theme registry
  - theme types
  - template manifest schema
  - demo template support
  - starter-site template manifest
- Theme tokens resolve from the centralized theme registry.
- Template import/export is server-only and admin-capable only.
- Template import/export is limited to pages, posts, and redirects.
- Template writes construct allowlisted Payload data server-side.
- Template import/export uses overrideAccess: false.
- Template page builder JSON validates through @nexpress/builder-core.
- Unknown/invalid template builder blocks are rejected.
- packages/plugins exists.
- apps/web depends on @nexpress/plugins.
- @nexpress/plugins owns:
  - versioned plugin manifest schema
  - unsafe-manifest rejection
  - typed capabilities
  - deterministic local registry
  - dependency/conflict validation
  - optional module resolution
  - migration planning metadata
- Local allowlisted plugin definitions currently include:
  - blog-pack
  - commerce-pack
  - forms-pack
  - membership-pack
  - seo-pack
- These local plugin definitions are metadata-only placeholders, not runtime feature implementations.
- Hidden protected plugin-states persistence exists in Payload.
- Server-only plugin activation/deactivation/migration planning/migration execution exists.
- Capability checks fail closed.
- Plugin APIs exist at:
  - /api/plugins
  - /api/plugins/activate
  - /api/plugins/deactivate
  - /api/plugins/migrations/plan
  - /api/plugins/migrations/run
- Phase 13 updated RBAC permissions and audit action ids without changing public-route behavior.
- Current tests after Phase 13:
  - root: 95/95 passing.
  - apps/web: 66/66 passing.
  - packages/plugins: 9/9 passing.
  - packages/builder-core, packages/builder-editor, packages/themes checks also passed.
- Known gaps:
  - no live DB-backed Payload migration file was generated for plugin-states.
  - no dedicated dashboard UI for plugin management yet.
  - local plugin definitions are metadata-only placeholders, not runtime commerce/forms/membership implementations.
  - no persisted site-wide theme selector yet.
  - media binaries are not packaged by templates.
  - template import/export has APIs and tests but no dedicated dashboard UI.
  - no publish workflow UI.
  - no revision history/collaboration.
  - no relation-backed builder media resolution yet.
  - Puck 0.20.2 is upstream-deprecated / behind latest, but the builder kernel remains vendor-neutral.
  - no live-DB migration file for the page builder field because migration generation requires a live database.
  - audit is fail-open and not transactional.
  - install flow has two sequential writes without a DB transaction.
  - no live-DB integration test for install/auth/audit yet.
  - dashboard protection is helper-test level rather than full e2e route tests.
  - no interactive mobile dashboard sidebar.
  - no theme switcher yet.
  - media is public-read by design; protected/private media is out of scope.
- No MCP, Medusa, storefront commerce, checkout, orders, carts, coupons, shipping, taxes, or inventory logic has been added yet.

Before doing anything, read:
- AGENTS.md or the correct tool-specific instruction file for your tool
- PLAN.md
- 01-final-decision-record.md
- IMPLEMENTATION_STATUS.md
- docs/product/v1-scope.md
- docs/decisions/README.md
- docs/decisions/0002-v1-product-scope-freeze.md
- docs/decisions/0003-v1-architecture-constraints.md
- docs/runbooks/migrations.md
- docs/runbooks/installation.md
- docs/runbooks/identity-rbac-audit.md
- docs/runbooks/themes-templates.md
- docs/runbooks/plugins-modules.md
- 03-phases/README.md
- 03-phases/phase-14-forms-workflows/plan.md
- 03-phases/phase-14-forms-workflows/tasks.md
- 03-phases/phase-14-forms-workflows/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-13-plugin-module-system/review.md

Goal:
Complete Phase 14 — Forms and Workflows only.

High-level purpose:
Implement a safe forms and workflows foundation for MAG Builder / NexPress. This phase should add form builder blocks, form definitions, submission storage, validation, email/webhook action foundations, and spam/rate-limit controls. It must not implement commerce, MCP, full marketing automation, advanced workflow builder UI, or external integrations beyond safe foundations required by the phase plan.

Implementation requirements:
1. Implement Forms and Workflows according to the Phase 14 plan.
2. Add form definition model/collection if required by the plan.
3. Add submission storage model/collection if required by the plan.
4. Add safe form builder blocks integrated with @nexpress/builder-core if required by the plan.
5. Add form rendering support for public pages without exposing private submissions.
6. Add form submission route/action using Next.js App Router conventions.
7. Add server-side validation for all submitted fields.
8. Add spam and abuse controls.
9. Add rate-limit foundation.
10. Add honeypot or equivalent low-friction anti-spam control if required by the plan.
11. Add email action foundation only if required by the plan.
12. Add webhook action foundation only if required by the plan.
13. Add workflow action execution service that is server-only.
14. Add audit entries for workflow configuration changes or security-sensitive actions if consistent with existing audit conventions.
15. Keep all workflow execution server-side.
16. Add tests for form schema validation, submission validation, spam/rate controls, action execution safety, webhook URL validation, and access control where practical.
17. Generate/update Payload types if collections are changed.
18. Update IMPLEMENTATION_STATUS.md.
19. Update plans/context.md.
20. Update plans/SESSION_LOG.md.
21. Create or update plans/phase-14-forms-workflows/review.md.

Forms requirements:
1. Forms must be typed and validated.
2. Form IDs/slugs must be stable and normalized.
3. Form field definitions must be allowlisted.
4. Form fields must not allow arbitrary executable code.
5. Form fields must not allow unsafe raw HTML.
6. Supported v1 field types should be minimal and safe, for example:
   - text
   - textarea
   - email
   - checkbox
   - select
   - hidden if required and safe
7. File uploads should remain out of scope unless Phase 14 explicitly requires them.
8. Form rendering must not expose private configuration or secrets.
9. Submissions must be stored server-side only.
10. Public users must not be able to read other submissions.
11. Admin/editor access to form definitions and submissions must follow RBAC.
12. Submissions must sanitize stored metadata.
13. Stored submissions must not include raw secrets or private runtime config.
14. Validation errors must not leak implementation details.

Builder integration requirements:
1. Add a form block to @nexpress/builder-core only if required by the Phase 14 plan.
2. The form block must validate props strictly.
3. The form block must reference an allowlisted form id/slug, not arbitrary executable data.
4. The form block must render safely through the public renderer.
5. The visual editor adapter should support the form block only if required and only as editor-only config.
6. Do not couple form builder blocks to Puck data structures.
7. Public rendering must remain @nexpress/builder-core.
8. Unknown/invalid blocks must still fail safely.

Submission requirements:
1. Submission endpoint must validate all inputs server-side.
2. Submission endpoint must reject unknown fields.
3. Submission endpoint must enforce required fields.
4. Submission endpoint must validate email format for email fields.
5. Submission endpoint must validate select options against the form definition.
6. Submission endpoint must enforce max lengths.
7. Submission endpoint must sanitize strings.
8. Submission endpoint must store safe metadata only.
9. Submission endpoint must avoid storing IP addresses in raw form unless the plan explicitly requires it; prefer hashed/truncated/minimized metadata if abuse controls need it.
10. Submission endpoint must not accept client-provided status/admin fields.
11. Submission endpoint must not expose full internal errors to users.
12. Submission must be idempotent where practical, or explicitly documented if not.

Spam/rate-limit requirements:
1. Add rate-limit foundation for submission endpoints.
2. Abuse controls should fail closed when abuse is detected.
3. Honeypot field should be ignored for normal users and reject bots if filled.
4. Do not rely only on client-side rate limiting.
5. Do not add paid captcha/service dependency unless Phase 14 explicitly requires it.
6. Add tests for rate-limit/honeypot behavior where practical.
7. Document known limitations of in-memory rate limits if used.
8. Avoid collecting unnecessary personal data for abuse controls.

Email action requirements:
1. Do not send real production email unless provider configuration is explicitly available and safe.
2. Add a provider-agnostic email action interface if required.
3. Email action must validate recipient configuration.
4. Email templates must not render unsafe raw user input.
5. Email actions must not expose secrets in logs, audit metadata, or responses.
6. If email action is stubbed in Phase 14, document the provider gap clearly.
7. Do not add a heavy email dependency unless justified by the phase plan.

Webhook action requirements:
1. Webhook actions must validate URLs server-side.
2. Webhook actions must allow only http/https schemes if enabled by the plan, preferably https for production.
3. Webhook actions must reject localhost, private IP ranges, link-local addresses, metadata service IPs, file URLs, javascript URLs, data URLs, and other dangerous destinations.
4. Webhook actions should use an allowlist if the phase plan requires or if a safe default can be implemented.
5. Disable redirects or limit redirects safely to avoid SSRF bypasses.
6. Do not return raw webhook responses to clients.
7. Add timeout and payload size limits.
8. Do not include secrets in webhook payloads unless explicitly configured server-side in a future phase.
9. Log only safe webhook execution metadata.
10. Webhook actions must be tested against unsafe URL cases.
11. Do not execute webhooks from public client components.

Workflow requirements:
1. Workflow action execution must be server-only.
2. Workflow actions must be typed and allowlisted.
3. Supported v1 actions should be minimal:
   - store submission
   - email notification stub/provider interface if required
   - webhook notification foundation if required
4. Workflow actions must fail safely.
5. Workflow failures must not leak secrets to clients.
6. Workflow execution should record safe status/result metadata.
7. Workflow configuration must be protected by RBAC.
8. Public users must not be able to configure workflows.

Plugin integration requirements:
1. The forms-pack plugin may be connected to capability checks only if Phase 14 requires it.
2. Do not implement full plugin runtime execution.
3. Do not allow plugins to inject arbitrary form actions.
4. Do not allow plugins to execute code from manifests.
5. Capability checks should fail closed if forms-pack is disabled.
6. If forms are gated by plugin capability, document the behavior clearly.

Payload requirements:
1. Add Forms/Submissions collections only if required by the plan.
2. Form definitions must not be publicly writable.
3. Submissions must not be publicly readable.
4. Public create access for submissions must be carefully controlled through validated route/action, not broad collection create access if avoidable.
5. Keep users, audit logs, installation-state, plugin-states, and system collections protected.
6. Respect collection access control.
7. Keep Local API usage server-only.
8. If using Payload Local API, document overrideAccess behavior.
9. Remember that Payload Local API skips access control by default unless overrideAccess is set to false.
10. Generate/update Payload types if collections are changed.
11. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Security requirements:
1. No secrets in client components.
2. No raw runtime config exposed to public UI.
3. No private collections fetched in public components.
4. No arbitrary code execution from form definitions, workflow configs, webhook configs, template manifests, plugin manifests, or builder JSON.
5. No eval, new Function, dynamic script execution, unsafe dynamic imports, or script injection.
6. Do not render unsanitized raw HTML.
7. Validate and sanitize all form inputs server-side.
8. Use allowlists for field types, workflow actions, and webhook destinations.
9. Protect against SSRF for webhook actions.
10. Do not store unnecessary sensitive personal data.
11. Do not store passwords, secrets, tokens, DATABASE_URL, PAYLOAD_SECRET, or private config in submissions, logs, or audit metadata.
12. Do not expose submissions publicly.
13. Do not expose webhook responses to clients.
14. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin protections from previous phases.
15. Client-side hiding is not a security boundary.
16. Public bundle should not include admin/editor/workflow-management-only code where avoidable.
17. Be mindful of automated form spam; implement server-side abuse controls.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers for submission APIs if an endpoint is required.
- Route Handlers must live inside the app directory.
- Keep Server Components as default.
- Client Components are allowed only for necessary form interactivity/progressive enhancement.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health.

Out of scope:
- Do not implement full marketing automation.
- Do not implement a complex workflow builder UI.
- Do not implement custom user-written workflow code.
- Do not implement background job queues unless Phase 14 explicitly requires a small interface/stub.
- Do not implement file upload forms unless Phase 14 explicitly requires them.
- Do not implement paid captcha provider integration unless Phase 14 explicitly requires it.
- Do not implement CRM.
- Do not implement newsletter marketing platform.
- Do not implement commerce checkout/order workflows.
- Do not implement MCP.
- Do not implement Medusa.
- Do not implement storefront commerce, checkout, payments, orders, carts, coupons, shipping, taxes, or inventory.
- Do not implement collaboration, revision history UI, scheduling, localization, multisite, organizations, or teams.
- Do not start Phase 15.

Acceptance criteria:
- Form builder blocks exist if required by the plan.
- Forms can be rendered safely on public pages.
- Form submissions work through a validated server endpoint/action.
- Submission validation works.
- Submission storage exists and is protected.
- Email/webhook workflow action foundations exist if required by the plan.
- Abuse controls exist.
- Rate-limit foundation exists.
- Webhook SSRF protections exist if webhook actions are implemented.
- Submissions are not publicly readable.
- Form configuration is protected by RBAC.
- Existing public routes still render.
- Payload admin still works.
- Project dashboard still works.
- Visual editor still works.
- Theme/template system still works.
- Plugin/module system still works.
- Published-only public behavior remains intact.
- Existing install/RBAC/audit/dashboard/public/content/builder/editor/theme/template/plugin tests still pass.
- New tests cover forms, submission validation, access control, spam/rate controls, webhook URL rejection, and unsafe rejection.
- .env.example is updated only if Phase 14 adds required variables.
- Payload types are regenerated if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 14 complete only.
- No Phase 15 or later work is implemented.

Verification commands:
Run from the repository root:
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build

Also run package/app checks:
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
Stop immediately after Phase 14. Provide a review summary with:
- Files changed
- Packages added
- Form collections/models added
- Submission storage mechanism
- Form builder blocks added
- Public rendering changes
- Submission endpoint/action
- Validation approach
- Spam/rate-limit controls
- Email action foundation
- Webhook action foundation
- Workflow execution model
- Plugin/capability integration
- Payload/access-control changes
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps