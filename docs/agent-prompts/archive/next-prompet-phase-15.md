You are starting a NEW SESSION.

This is a greenfield production project called MAG Builder / NexPress. There is no old codebase to refactor.

Your job is to complete Phase 15 only.

Current completed state:
- Phase 00 completed the monorepo/bootstrap scaffold.
- Phase 01 completed product governance, v1 scope freeze, and architecture constraints.
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
- Forms helpers/services exist under apps/web/src/lib/forms.
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
  - forms
  - form-submissions
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
  - core.form
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
- These local plugin definitions are metadata-only placeholders unless implemented by a later phase.
- Hidden protected plugin-states persistence exists in Payload.
- packages/forms exists.
- apps/web depends on @nexpress/forms.
- @nexpress/forms owns:
  - typed form schemas
  - field validation
  - submission validation
  - sanitization
  - SSRF-protected webhook foundation
  - email provider stub
  - in-memory rate limiter
  - typed workflow engine
- Forms collection exists.
- FormSubmissions collection exists.
- FormSubmissions.create is denied through Payload collection access.
- Submissions are created only through the server-side forms service after validation.
- Public form definition API exists at /api/forms/[formId]/public.
- Public form submission API exists at /api/forms/[formId]/submit.
- Webhook actions are HTTPS-only, block private IPs/cloud metadata services, disable redirects, use 10s timeout, and limit payloads to 32KB.
- Email provider is a stub only.
- Form rate limiter is in-memory: 5 submissions/form/minute per client.
- Honeypot returns fake success for bots.
- Current known gaps:
  - no live DB migration files for recent Payload collection additions because migration generation requires a live database.
  - no client-side form rendering component yet.
  - email actions are stubs.
  - rate limiter is in-memory only; Redis/distributed rate limiting is needed for multi-process production.
  - no dedicated dashboard UI for plugin management.
  - no persisted site-wide theme selector yet.
  - no publish workflow UI.
  - no revision history/collaboration.
  - no relation-backed builder media resolution yet.
  - Puck 0.20.2 is upstream-deprecated / behind latest, but the builder kernel remains vendor-neutral.
  - audit is fail-open and not transactional.
  - install flow has two sequential writes without a DB transaction.
  - no live-DB integration test for install/auth/audit yet.
  - dashboard protection is helper-test level rather than full e2e route tests.
  - no interactive mobile dashboard sidebar.
  - protected/private media is out of scope.
- Verification after Phase 14 passed:
  - pnpm install
  - pnpm typecheck
  - pnpm lint
  - pnpm test
  - pnpm build
  - packages/forms tests: 41 passing
  - packages/builder-core tests: 9 passing
  - apps/web tests: 74 passing
- No MCP, Medusa, storefront commerce, checkout, orders, carts, coupons, shipping, taxes, or inventory logic has been added yet.

Before doing anything, read:
- AGENTS.md or the correct tool-specific instruction file for your tool
- PLAN.md
- IMPLEMENTATION_STATUS.md
- 01-final-decision-record.md
- docs/product/v1-scope.md
- docs/decisions/README.md
- docs/decisions/0002-v1-product-scope-freeze.md
- docs/decisions/0003-v1-architecture-constraints.md
- docs/runbooks/migrations.md
- docs/runbooks/installation.md
- docs/runbooks/identity-rbac-audit.md
- docs/runbooks/themes-templates.md
- docs/runbooks/plugins-modules.md
- docs/runbooks/forms-workflows.md
- 03-phases/README.md
- 03-phases/phase-15-public-membership-protected-routes/plan.md
- 03-phases/phase-15-public-membership-protected-routes/tasks.md
- 03-phases/phase-15-public-membership-protected-routes/acceptance-criteria.md
- 02-architecture/* as needed
- plans/context.md
- plans/SESSION_LOG.md
- plans/phase-14-forms-workflows/review.md

Goal:
Complete Phase 15 — Public Membership and Protected Routes only.

High-level purpose:
Implement the public membership foundation for MAG Builder / NexPress. This phase should add safe public member identity, public auth routes, protected public route gating, membership-aware content access, and minimal account/profile foundations. It must not implement commerce subscriptions, payments, SaaS organizations, teams, advanced memberships, or private community features unless explicitly required by the Phase 15 plan.

Implementation requirements:
1. Implement public membership and protected routes according to the Phase 15 plan.
2. Add a public member model/collection if required by the plan.
3. Decide whether to extend the existing users collection or add a separate members/customers collection according to the plan and existing ADRs.
4. Keep admin/dashboard users and public members clearly separated unless the plan explicitly says otherwise.
5. Add public auth routes only as required by the Phase 15 plan.
6. Add public sign-up route if required by the plan.
7. Add public login route if required by the plan.
8. Add public logout route if required by the plan.
9. Add account/profile route foundation if required by the plan.
10. Add protected route guard helpers for public pages.
11. Add server-side protected route checks.
12. Add membership-aware public content access helpers.
13. Add route-level protection for protected public content.
14. Add tests for membership access helpers, auth guard behavior, protected content behavior, and unsafe access rejection where practical.
15. Generate/update Payload types if collections are changed.
16. Update IMPLEMENTATION_STATUS.md.
17. Update plans/context.md.
18. Update plans/SESSION_LOG.md.
19. Create or update plans/phase-15-public-membership-protected-routes/review.md.

Membership model requirements:
1. Public member identity must be typed and explicit.
2. Public member identity must not automatically grant dashboard/admin privileges.
3. Admin roles such as super-admin/admin/editor must not be assignable through public sign-up.
4. Public sign-up must not allow role escalation.
5. Public members must not be able to access /dashboard, /admin, audit logs, plugin states, installation state, system collections, or private admin data.
6. Public members must not be treated as editor/admin users.
7. Public members should have minimal fields required by the Phase 15 plan.
8. Do not store plaintext passwords or secrets.
9. Do not expose sensitive member fields in public APIs.
10. If using Payload auth for members, keep collection access rules strict.

Public auth requirements:
1. Public auth routes must be implemented server-side using App Router conventions.
2. Public login/sign-up must validate input server-side.
3. Public auth errors must be generic enough to avoid user enumeration where practical.
4. Public sign-up must reject weak passwords if passwords are supported.
5. Public sign-up must normalize and validate email addresses.
6. Public logout must clear the correct member session without weakening admin sessions.
7. Do not expose session tokens in URLs.
8. Do not store tokens in localStorage.
9. Prefer HTTP-only cookies when possible.
10. Avoid mixing public member sessions with dashboard/admin sessions unless intentionally designed and documented.
11. Add tests for auth validation and role escalation prevention where practical.

Protected routes requirements:
1. Protected route checks must run server-side.
2. Client-side hiding is not a security boundary.
3. Protected public routes must redirect or return unauthorized safely when unauthenticated.
4. Authenticated public members must only access resources they are allowed to access.
5. Public protected content must not expose draft content.
6. Public protected content must not expose admin/system/private collection data.
7. Implement minimal route guard utilities for reuse by future phases.
8. Add tests for unauthenticated, authenticated, and unauthorized access behavior where practical.
9. Do not protect /admin or /dashboard with public membership logic; keep existing admin/dashboard protections intact.
10. Do not make public routes depend on dashboard-only code.

Content protection requirements:
1. If Phase 15 adds protected content fields, ensure public reads respect those fields.
2. Keep published-only behavior intact.
3. Draft content must remain protected.
4. Protected content must not appear in sitemap/robots if it should not be indexed.
5. Protected content metadata must not leak private content.
6. Protected content access must use server-side helpers.
7. Do not expose protected content through /api/[...slug] or custom APIs without access checks.
8. Add tests for public/protected content filtering where practical.

Payload requirements:
1. Respect Payload collection access control.
2. Keep users, audit logs, installation-state, plugin-states, form-submissions, and system collections protected.
3. If a Members collection is added, configure auth/access carefully.
4. If using existing Users collection, ensure public registration cannot create admin/editor/super-admin users.
5. Keep Local API usage server-only.
6. If using Payload Local API, document overrideAccess behavior.
7. Remember that Payload Local API skips access control by default unless overrideAccess is set to false.
8. Use overrideAccess: false when operations should respect current-user permissions.
9. Generate/update Payload types if collections are changed.
10. Add migrations only if a live DB is available and the plan requires it; otherwise document the migration gap consistently.

Plugin integration requirements:
1. If membership features are gated by membership-pack, check capability state server-side.
2. Capability checks must fail closed if membership-pack is disabled.
3. Do not execute plugin code from manifests.
4. Do not implement full plugin runtime execution.
5. Do not add marketplace or remote plugins.
6. Document whether Phase 15 membership routes require membership-pack activation or are core platform features.

Security requirements:
1. No secrets in client components.
2. No raw runtime config exposed to public UI.
3. Do not expose private collections in public components.
4. Do not expose users, audit logs, installation-state, plugin-states, form-submissions, admin data, system data, or private runtime config publicly.
5. Do not expose session tokens to JavaScript.
6. Do not store auth tokens in localStorage.
7. Do not allow privilege escalation from public sign-up.
8. Do not allow public members to become super-admin/admin/editor.
9. Do not leak whether an email exists where avoidable.
10. Do not weaken existing admin/dashboard/install/RBAC/audit/content/builder/editor/theme/template/plugin/forms protections.
11. Do not render unsanitized raw HTML.
12. Validate and sanitize all public auth inputs server-side.
13. Use server-side authorization for protected routes.
14. Client-side hiding is not a security boundary.
15. Public bundle should not include admin/dashboard/plugin/form-management-only code where avoidable.
16. Follow least privilege: grant only the minimum permissions needed for membership features.

Next.js requirements:
- Use App Router conventions.
- Use Route Handlers only if a server endpoint is required.
- Route Handlers must live inside the app directory.
- Keep Server Components as default.
- Client Components are allowed only for necessary form/auth interactivity/progressive enhancement.
- Do not use Pages Router.
- Do not use next lint; use ESLint CLI.
- Do not eagerly validate runtime secrets during static build.
- Keep public routes stable.
- Do not break /, /[slug], /journal/[slug], /robots.txt, /sitemap.xml, /admin, /dashboard, /install, /api/health, /api/forms/[formId]/public, or /api/forms/[formId]/submit.

Out of scope:
- Do not implement commerce subscriptions.
- Do not implement paid memberships.
- Do not implement checkout, payments, orders, carts, coupons, shipping, taxes, or inventory.
- Do not implement Medusa.
- Do not implement MCP.
- Do not implement organizations, teams, tenant accounts, or SaaS billing.
- Do not implement social login unless Phase 15 explicitly requires it.
- Do not implement email verification unless Phase 15 explicitly requires it.
- Do not implement password reset unless Phase 15 explicitly requires it.
- Do not implement advanced profile management.
- Do not implement private messaging, community, courses, LMS, or forums.
- Do not implement protected media pipeline unless Phase 15 explicitly requires a small foundation.
- Do not implement CRM/newsletter features.
- Do not implement full dashboard UI for member management unless Phase 15 explicitly requires it.
- Do not start Phase 16.

Acceptance criteria:
- Public membership foundation exists.
- Public members cannot access admin/dashboard/system features.
- Public sign-up/login/logout/account routes exist only if required by the plan.
- Protected public route guards exist.
- Server-side protected route checks work.
- Membership-aware content access exists if required by the plan.
- Published-only public behavior remains intact.
- Draft content remains protected.
- Protected content does not leak into public metadata/sitemap if it should not.
- Existing admin/dashboard protections still work.
- Existing forms/workflows APIs still work.
- Existing plugin/theme/template/builder/editor/content tests still pass.
- New tests cover member auth, protected routes, access checks, and privilege escalation prevention where practical.
- .env.example is updated only if Phase 15 adds required variables.
- Payload types are regenerated if collections change.
- pnpm install passes if package changes were made.
- pnpm lint passes.
- pnpm typecheck passes.
- pnpm test passes.
- pnpm build passes.
- IMPLEMENTATION_STATUS.md marks Phase 15 complete only.
- No Phase 16 or later work is implemented.

Verification commands:
Run from the repository root:
- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build

Also run package/app checks:
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

If Payload collections are changed:
- pnpm --dir apps/web generate:types

Stop condition:
Stop immediately after Phase 15. Provide a review summary with:
- Files changed
- Packages added
- Membership collections/models added or changed
- Public auth routes added
- Account/protected routes added
- Protected route guard approach
- Membership-aware content access behavior
- Plugin/capability integration
- Payload/access-control changes
- Payload types/migrations status
- Tests added
- Commands run
- Security notes
- Known gaps