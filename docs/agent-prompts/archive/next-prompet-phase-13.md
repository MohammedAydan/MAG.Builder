You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 13 only.

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
- Exported manifests declare requiredBlocks from builder documents.
- No Puck imports were added to public routes or template manifests.
- Phase 12 added no new Payload collections and no Payload type regeneration was needed.
- Current tests after Phase 12:
  - root tests: 81/81 passing.
  - apps/web: 61/61 passing.
  - packages/builder-core: 9/9 passing.
  - packages/builder-editor: 4/4 passing.
  - packages/themes: 7/7 passing.
- Known gaps:
  - no persisted site-wide theme selector yet.
  - media binaries are not packaged in Phase 12.
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
- 03-phases/README.md
- 03-phases/phase-13-plugin-module-system/plan.md
- 03-phases/phase-13-plugin-module-system/tasks.md
- 03-phases/phase-13-plugin-module-system/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-12-themes-and-templates/review.md

Goal:
Complete Phase 13 — Plugin and Module System only.

High-level purpose:
Implement the first safe plugin/module foundation for MAG Builder / NexPress. This phase should create plugin manifest validation, plugin registry, activation/deactivation state, capability checks, and plugin migration planning/execution metadata. It must not implement marketplace installation, remote plugin execution, arbitrary uploaded plugins, commerce, MCP, or third-party code loading.

Implementation requirements:
1. Implement the plugin/module system according to the Phase 13 plan.
2. Add a versioned plugin manifest schema.
3. Add strict runtime validation for plugin manifests.
4. Add a centralized plugin registry.
5. Add typed plugin/module definitions.
6. Add activation/deactivation state model.
7. Add capability checks for plugin features.
8. Add plugin dependency/conflict checks if required by the plan.
9. Add plugin migration metadata and migration runner foundation if required by the plan.
10. Add server-only plugin service functions.
11. Add admin-capable APIs or server actions only if required by the plan.
12. Add audit entries for activation/deactivation and migration actions.
13. Ensure invalid plugins are rejected.
14. Ensure modules are optional and can be disabled safely.
15. Add tests for manifest validation, registry behavior, activation/deactivation, capability checks, and migration metadata.
16. Add docs/runbook for plugin/module operations if required.
17. Update IMPLEMENTATION_STATUS.md.
18. Update plans/context.md.
19. Update plans/SESSION_LOG.md.
20. Create or update plans/phase-13-plugin-module-system/review.md.

Plugin architecture requirements:
1. Plugins must be local/allowlisted only in Phase 13.
2. Do not load plugins from remote URLs.
3. Do not execute arbitrary uploaded plugin code.
4. Do not eval plugin code.
5. Do not use new Function.
6. Do not allow plugin manifests to contain executable scripts.
7. Do not allow plugin manifests to mutate arbitrary Payload collections.
8. Do not allow plugin manifests to write arbitrary files.
9. Do not allow plugin manifests to access secrets or raw runtime config.
10. Do not expose plugin internals to public routes.
11. Do not import plugin admin/editor code into public routes unless explicitly safe and required.
12. Plugin registration must be deterministic and testable.
13. Plugin definitions must be typed.
14. Plugin IDs must be stable, unique, normalized, and collision-safe.
15. Plugin versions must be explicit and validated.
16. Plugin capabilities must be explicit and allowlisted.
17. Plugin activation must fail safely if dependencies or capabilities are invalid.
18. Plugin deactivation must not delete user content unless explicitly designed and confirmed by the plan.

Manifest schema requirements:
1. Manifest schema must be versioned.
2. Manifest must include plugin id, name, version, description, capabilities, optional dependencies, and module declarations as required by the plan.
3. Manifest must reject protected keys such as secrets, tokens, passwords, DATABASE_URL, PAYLOAD_SECRET, private config, shell commands, scripts, or executable hooks.
4. Manifest must reject unsafe HTML/executable markers.
5. Manifest must reject unknown capability values unless the registry explicitly supports them.
6. Manifest must validate compatibility with current platform/plugin API version.
7. Manifest must support future extension through safe namespaced metadata only.
8. Manifest validation must be covered by tests.

Registry requirements:
1. Create a centralized plugin registry package or app module according to the plan.
2. Registry must register only trusted local plugin definitions.
3. Registry must validate plugin manifests before registration.
4. Registry must reject duplicate IDs.
5. Registry must expose safe read APIs for enabled/available plugins.
6. Registry must support optional modules without forcing them on.
7. Registry must not mutate runtime global state unpredictably.
8. Registry must not import public-unsafe code into public rendering.
9. Registry must be covered by tests.

Activation/deactivation requirements:
1. Activation must be restricted to admin-capable or super-admin users according to existing RBAC.
2. Deactivation must be restricted to admin-capable or super-admin users according to existing RBAC.
3. Activation/deactivation must be server-side only.
4. Activation must validate manifest, dependencies, conflicts, and capabilities before writing state.
5. Activation must be audited.
6. Deactivation must be audited.
7. Activation/deactivation should be idempotent where practical.
8. Activation/deactivation should never expose secrets.
9. Activation/deactivation must not break public routes when a plugin is disabled.
10. Activation/deactivation must not bypass Payload access control casually.
11. If using Payload Local API server-side, document overrideAccess behavior.
12. If operations should respect current user permissions, use overrideAccess: false.

Capability checks:
1. Capabilities must be explicit and typed.
2. Capability checks must be centralized.
3. Capability checks must be used by plugin/module feature gates.
4. Do not scatter raw string checks across the app.
5. Public routes must not trust client-side capability checks.
6. Feature code must fail closed when a plugin/capability is disabled.
7. Capability tests must cover enabled, disabled, invalid, and missing-plugin cases.

Plugin migration requirements:
1. Add plugin migration metadata foundation if Phase 13 requires it.
2. Do not run destructive migrations by default.
3. Plugin migrations must be explicit, versioned, and auditable.
4. Plugin migration status must be trackable.
5. Plugin migration runner must reject unknown plugins/migrations.
6. Migration execution must be server-only and admin/super-admin restricted.
7. Do not generate live DB migrations unless a live DB is available and the plan requires it.
8. Document the live-DB migration gap consistently if no migration file is generated.
9. Do not modify existing Payload migration strategy unless required by the phase plan.

Payload/content/builder/theme integration requirements:
1. Do not create public read access to users, audit logs, installation-state, plugin activation state, or system collections.
2. If a plugin state collection is added, hide it and protect it with super-admin/admin-only access.
3. Keep pages/posts/media/redirects access behavior intact.
4. Keep published-only public behavior intact.
5. Keep @nexpress/builder-core as the source of truth for builder schema/rendering.
6. Keep @nexpress/builder-editor editor-only.
7. Keep @nexpress/themes as theme/template foundation.
8. Do not let plugins inject raw builder blocks unless those blocks are registered and validated safely.
9. Do not implement plugin-provided arbitrary React components in public rendering in Phase 13 unless the plan explicitly requires a safe stub.
10. Do not couple plugins to Puck/editor internals.

Security requirements:
1. Apply least privilege: plugin operations should only get the minimum capabilities needed. OWASP emphasizes least privilege to reduce attack surface and blast radius.
2. Treat plugin manifests and plugin imports as untrusted input even when local.
3. No secrets in manifests, exports, imports, client components, logs, or audit metadata.
4. No raw runtime config exposed to plugin code.
5. No arbitrary code execution.
6. No remote code loading.
7. No shell command execution.
8. No eval, new Function, dynamic script execution, unsafe dynamic imports, or script injection.
9. No unsanitized raw HTML rendering.
10. No plugin access to DATABASE_URL, PAYLOAD_SECRET, tokens, passwords, or private config.
11. Do not weaken admin/dashboard/install/RBAC/audit/content/builder/editor/template protections from previous phases.
12. Client-side hiding is not a security boundary.
13. Public bundle should not include admin/editor/plugin-management-only code where avoidable.
14. Be mindful of supply-chain risk: do not add unnecessary third-party packages for this phase.
15. If adding a package is unavoidable, justify it in the review and keep it minimal.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers only if a server endpoint is required.
- Route Handlers must live inside the app directory.
- Keep Server Components as the default.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health.

Payload requirements:
- Payload admin at /admin must still work.
- Project dashboard at /dashboard must still work.
- Respect collection access control.
- Do not create public read access to users, audit logs, installation-state, plugin state, or system collections.
- Keep Local API usage server-only.
- Generate/update Payload types if collections are changed.
- Add migrations only if Phase 13 requires collection changes and a live DB is available; otherwise document the migration gap consistently with earlier phases.
- Remember that Payload Local API skips access control by default unless overrideAccess is set to false.

Out of scope:
- Do not implement plugin marketplace.
- Do not implement remote plugin installation.
- Do not implement arbitrary user-uploaded executable plugins.
- Do not implement npm package installation from the UI.
- Do not implement plugin sandbox runtime.
- Do not implement arbitrary plugin-provided server code execution.
- Do not implement plugin-provided database migrations that can run destructive changes automatically.
- Do not implement plugin-provided public React components unless Phase 13 explicitly requires a safe placeholder.
- Do not implement plugin UI marketplace.
- Do not implement MCP.
- Do not implement Medusa.
- Do not implement storefront commerce.
- Do not implement checkout, payments, orders, carts, coupons, shipping, taxes, or inventory.
- Do not implement forms/workflows unless Phase 13 explicitly requires a plugin placeholder only.
- Do not implement collaboration, revision history UI, scheduling, localization, multisite, organizations, or teams.
- Do not start Phase 14.

Acceptance criteria:
- Plugin manifest schema exists.
- Plugin registry exists.
- Invalid plugin manifests are rejected.
- Plugin activation/deactivation exists.
- Activation/deactivation is audited.
- Capability checks exist and are centralized.
- Optional modules can be enabled/disabled safely.
- Plugin migrations metadata/foundation exists if required by the plan.
- Plugin state is protected and not publicly readable.
- Existing public routes still render.
- Payload admin still works.
- Project dashboard still works.
- Visual editor still works.
- Theme/template system still works.
- Published-only public behavior remains intact.
- Existing install/RBAC/audit/dashboard/public/content/builder/editor/theme/template tests still pass.
- New tests cover manifest validation, registry, activation/deactivation, capability checks, and unsafe rejection.
- .env.example is updated only if Phase 13 adds required variables.
- Payload types are regenerated if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 13 complete only.
- No Phase 14 or later work is implemented.

Verification commands:
Run from the repository root:
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build

Also run package/app checks:
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

If a new plugin package is created, also run its lint/typecheck/test/build scripts.

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 13. Provide a review summary with:
- Files changed
- Packages added
- Plugin packages/modules added
- Manifest schema files added
- Registry files added
- Activation/deactivation mechanism
- Capability checks added
- Plugin migration foundation
- Payload/content/builder/theme integration changes
- Access-control changes
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps