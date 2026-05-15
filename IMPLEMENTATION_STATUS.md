# Implementation Status

Project: NexPress
Mode: Greenfield
Current phase: 15-membership-public-protection
Overall status: in-progress

The platform foundation, Payload CMS foundation, database/migration/seed layer, install/runtime configuration foundation, identity/RBAC/audit foundation, admin dashboard shell, public design-system shell, CMS content/media/SEO foundation, builder kernel, visual editor adapter, themes/templates foundation, plugin/module system, forms/workflows foundation, and public membership/protected-route foundation are implemented. Commerce, APIs beyond current routes, and MCP features remain out of scope for the current repository state.

## Phase tracker

- [x] Phase 00 - Greenfield Bootstrap: done
- [x] Phase 01 - Product Lock and ADR: done
- [x] Phase 02 - Next.js Platform Foundation: done
- [x] Phase 03 - Payload CMS Foundation: done
- [x] Phase 04 - Database, Migrations, and Seed: done
- [x] Phase 05 - Install Wizard and Runtime Config: done
- [x] Phase 06 - Identity, RBAC, and Audit: done
- [x] Phase 07 - Admin Dashboard Shell: done
- [x] Phase 08 - Design System and Public Shell: done
- [x] Phase 09 - Content, Media, and SEO: done
- [x] Phase 10 - Builder Kernel: done
- [x] Phase 11 - Visual Editor Adapter: done
- [x] Phase 12 - Themes and Templates: done
- [x] Phase 13 - Plugin and Module System: done
- [x] Phase 14 - Forms and Workflows: done
- [x] Phase 15 - Public Membership and Protected Routes: done
- [ ] Phase 16 - Commerce Service Spike: not-started
- [ ] Phase 17 - Commerce MVP: not-started
- [ ] Phase 18 - Storefront Commerce Blocks: not-started
- [ ] Phase 19 - API Platform and OpenAPI: not-started
- [ ] Phase 20 - Webhooks and Integrations: not-started
- [ ] Phase 21 - MCP Native Gateway: not-started
- [ ] Phase 22 - Search, Analytics, and Automation: not-started
- [ ] Phase 23 - Multi-site and SaaS Readiness: not-started
- [ ] Phase 24 - Marketplace, Packaging, and Updates: not-started
- [ ] Phase 25 - Observability and Security Hardening: not-started
- [ ] Phase 26 - Production Deployment and Docs: not-started
- [ ] Phase 27 - Final Release Candidate: not-started

## Current session log

### Date

2026-05-15

### Agent/tool

Codex (GPT-5)

### Requested phase

Phase 15 - Public Membership and Protected Routes

### Files changed

- `apps/web/src/collections/{Members,Pages,Posts}.ts` - added a dedicated public member auth collection plus content visibility fields for pages/posts
- `apps/web/src/lib/auth/{access.ts,access.test.ts}` - added member/self access helpers and anonymous-vs-member published content rules
- `apps/web/src/lib/audit/service.ts` - added member registration/login/logout/profile audit action ids
- `apps/web/src/lib/content/{access-fields.ts,public.ts,public.test.ts}` - added typed content visibility fields and member-aware protected-content resolution helpers/tests
- `apps/web/src/lib/members/{service.ts,service.test.ts}` - added server-only member validation, session, sign-up/login/logout/profile, and guard helpers
- `apps/web/src/app/(public)/{login,signup,account}/page.tsx` - added public auth pages and a protected account/profile route
- `apps/web/src/app/api/members/**/*` - added server-side member sign-up, login, logout, and profile handlers
- `apps/web/src/lib/public-shell/{navigation.ts,content.test.ts}` - exposed the member login entry in the public shell
- `apps/web/src/payload.config.ts`
- `apps/web/src/payload-types.ts`
- `docs/runbooks/membership-protected-routes.md`
- `plans/phase-15-membership-public-protection/review.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `IMPLEMENTATION_STATUS.md`

### Commands run

- `pnpm.cmd install`
- `pnpm.cmd lint`
- `pnpm.cmd typecheck`
- `pnpm.cmd test`
- `pnpm.cmd build`
- `pnpm.cmd --dir packages/plugins lint`
- `pnpm.cmd --dir packages/plugins typecheck`
- `pnpm.cmd --dir packages/plugins test`
- `pnpm.cmd --dir packages/plugins build`
- `pnpm.cmd --dir packages/builder-core lint`
- `pnpm.cmd --dir packages/builder-core typecheck`
- `pnpm.cmd --dir packages/builder-core test`
- `pnpm.cmd --dir packages/builder-core build`
- `pnpm.cmd --dir packages/builder-editor lint`
- `pnpm.cmd --dir packages/builder-editor typecheck`
- `pnpm.cmd --dir packages/builder-editor test`
- `pnpm.cmd --dir packages/builder-editor build`
- `pnpm.cmd --dir packages/themes lint`
- `pnpm.cmd --dir packages/themes typecheck`
- `pnpm.cmd --dir packages/themes test`
- `pnpm.cmd --dir packages/themes build`
- `pnpm.cmd --dir apps/web lint`
- `pnpm.cmd --dir apps/web typecheck`
- `pnpm.cmd --dir apps/web test`
- `pnpm.cmd --dir apps/web build`
- `pnpm.cmd --dir apps/web generate:types`
- `pnpm.cmd --dir packages/forms lint`
- `pnpm.cmd --dir packages/forms typecheck`
- `pnpm.cmd --dir packages/forms test`
- `pnpm.cmd --dir packages/forms build`
- `pnpm.cmd --dir packages/plugins lint`
- `pnpm.cmd --dir packages/plugins typecheck`
- `pnpm.cmd --dir packages/plugins test`
- `pnpm.cmd --dir packages/plugins build`
- `pnpm.cmd --dir packages/builder-core lint`
- `pnpm.cmd --dir packages/builder-core typecheck`
- `pnpm.cmd --dir packages/builder-core test`
- `pnpm.cmd --dir packages/builder-core build`
- `pnpm.cmd --dir packages/builder-editor lint`
- `pnpm.cmd --dir packages/builder-editor typecheck`
- `pnpm.cmd --dir packages/builder-editor test`
- `pnpm.cmd --dir packages/builder-editor build`
- `pnpm.cmd --dir packages/themes lint`
- `pnpm.cmd --dir packages/themes typecheck`
- `pnpm.cmd --dir packages/themes test`
- `pnpm.cmd --dir packages/themes build`

### Test results

- `pnpm.cmd install` - passed
- `pnpm.cmd lint` - passed
- `pnpm.cmd typecheck` - passed
- `pnpm.cmd test` - passed (95/95 tests, 29 test files across `apps/web`, `packages/builder-core`, `packages/builder-editor`, `packages/themes`, and `packages/plugins`)
- `pnpm.cmd build` - passed
- `pnpm.cmd --dir packages/plugins lint` - passed
- `pnpm.cmd --dir packages/plugins typecheck` - passed
- `pnpm.cmd --dir packages/plugins test` - passed (9/9 tests, 2 test files)
- `pnpm.cmd --dir packages/plugins build` - passed
- `pnpm.cmd --dir packages/builder-core lint` - passed
- `pnpm.cmd --dir packages/builder-core typecheck` - passed
- `pnpm.cmd --dir packages/builder-core test` - passed (9/9 tests, 4 test files)
- `pnpm.cmd --dir packages/builder-core build` - passed
- `pnpm.cmd --dir packages/builder-editor lint` - passed
- `pnpm.cmd --dir packages/builder-editor typecheck` - passed
- `pnpm.cmd --dir packages/builder-editor test` - passed (4/4 tests, 2 test files)
- `pnpm.cmd --dir packages/builder-editor build` - passed
- `pnpm.cmd --dir packages/themes lint` - passed
- `pnpm.cmd --dir packages/themes typecheck` - passed
- `pnpm.cmd --dir packages/themes test` - passed (7/7 tests, 2 test files)
- `pnpm.cmd --dir packages/themes build` - passed
- `pnpm.cmd --dir apps/web lint` - passed
- `pnpm.cmd --dir apps/web typecheck` - passed
- `pnpm.cmd --dir apps/web test` - passed (66/66 tests, 19 test files)
- `pnpm.cmd --dir apps/web build` - passed
- `pnpm.cmd --dir apps/web generate:types` - passed
- `pnpm.cmd --dir packages/forms lint` - passed
- `pnpm.cmd --dir packages/forms typecheck` - passed
- `pnpm.cmd --dir packages/forms test` - passed (41/41 tests, 3 test files)
- `pnpm.cmd --dir packages/forms build` - passed
- `pnpm.cmd --dir packages/plugins lint` - passed
- `pnpm.cmd --dir packages/plugins typecheck` - passed
- `pnpm.cmd --dir packages/plugins test` - passed (9/9 tests, 2 test files)
- `pnpm.cmd --dir packages/plugins build` - passed
- `pnpm.cmd --dir packages/builder-core lint` - passed
- `pnpm.cmd --dir packages/builder-core typecheck` - passed
- `pnpm.cmd --dir packages/builder-core test` - passed (9/9 tests, 4 test files)
- `pnpm.cmd --dir packages/builder-core build` - passed
- `pnpm.cmd --dir packages/builder-editor lint` - passed
- `pnpm.cmd --dir packages/builder-editor typecheck` - passed
- `pnpm.cmd --dir packages/builder-editor test` - passed (4/4 tests, 2 test files)
- `pnpm.cmd --dir packages/builder-editor build` - passed
- `pnpm.cmd --dir packages/themes lint` - passed
- `pnpm.cmd --dir packages/themes typecheck` - passed
- `pnpm.cmd --dir packages/themes test` - passed (7/7 tests, 2 test files)
- `pnpm.cmd --dir packages/themes build` - passed

### Security notes

- Public members are stored in a separate `members` auth collection; public sign-up never accepts or persists admin/editor/super-admin roles and does not touch the dashboard `users` collection
- Member sessions use the dedicated HTTP-only `nexpress-member-token` cookie with `SameSite=Lax`; tokens are never returned in URLs or stored in `localStorage`
- Member sign-up remains server-only: collection-level `members.create` is denied, and the route uses a narrow validated `overrideAccess: true` path similar to earlier bootstrap-only flows
- Member profile updates use `overrideAccess: false` with the authenticated member attached to the request so self-service writes still respect collection access rules
- Anonymous public reads now exclude `accessLevel=members` content, members-only content is filtered out of sitemap generation, and metadata generation fails closed when the viewer lacks access
- Existing install, RBAC, dashboard, audit, content, builder, editor, theme, template, plugin, and forms protections remain intact; public members do not gain `/dashboard`, `/admin`, audit-log, plugin-state, or installation-state access

### Blockers

- No live database-backed Payload migration file was generated for the new `members` collection or the `pages/posts.accessLevel` field because migration generation still requires a live database connection
- No password reset or email verification flow exists yet; both remain intentionally out of scope for Phase 15

### Next recommended prompt

Start Phase 16 only. Read PLAN.md, IMPLEMENTATION_STATUS.md, and `03-phases/phase-16-*` before implementing.

---

## Phase 14 - Forms and Workflows

Status: done
Implemented: 2026-05-15

### Files added

- `packages/forms/package.json` — `@nexpress/forms` workspace package
- `packages/forms/tsconfig.json`
- `packages/forms/vitest.config.ts`
- `packages/forms/src/types.ts` — Form definition schema, field types, public projection
- `packages/forms/src/validation.ts` — Server-side submission validation and sanitization
- `packages/forms/src/webhook.ts` — SSRF-protected webhook action foundation
- `packages/forms/src/email.ts` — Provider-agnostic email action interface and stub
- `packages/forms/src/rate-limit.ts` — In-memory rate limiter
- `packages/forms/src/workflow.ts` — Typed workflow action execution engine
- `packages/forms/src/index.ts` — Package public exports
- `packages/forms/src/types.test.ts` — Form definition schema tests (9 tests)
- `packages/forms/src/validation.test.ts` — Submission validation tests (12 tests)
- `packages/forms/src/security.test.ts` — SSRF and rate limit tests (20 tests)
- `apps/web/src/collections/Forms.ts` — Forms Payload collection
- `apps/web/src/collections/FormSubmissions.ts` — FormSubmissions Payload collection
- `apps/web/src/lib/forms/service.ts` — Server-only forms service
- `apps/web/src/lib/forms/service.test.ts` — Service tests (8 tests)
- `apps/web/src/app/api/forms/[formId]/public/route.ts` — Public form definition API
- `apps/web/src/app/api/forms/[formId]/submit/route.ts` — Form submission API
- `docs/runbooks/forms-workflows.md` — Forms runbook

### Files modified

- `packages/builder-core/src/blocks/core-blocks.tsx` — Added `core.form` block
- `apps/web/src/payload.config.ts` — Registered Forms and FormSubmissions collections
- `apps/web/src/lib/auth/permissions.ts` — Added `forms:manage` and `forms:read` permissions
- `apps/web/src/lib/auth/access.ts` — Added `formDefinitionsAdminReadAccess` and `formDefinitionsManageAccess`
- `apps/web/src/lib/audit/service.ts` — Added `formSubmitted` and `formWorkflowExecuted` audit actions
- `apps/web/package.json` — Added `@nexpress/forms: workspace:*` dependency

### Commands run

- `pnpm install` — passed (all 25 workspace projects)
- `pnpm --dir packages/forms typecheck` — passed
- `pnpm --dir packages/forms test` — passed (41 tests across 3 files)
- `pnpm --dir packages/builder-core test` — passed (9 tests across 4 files)
- `pnpm --dir apps/web typecheck` — passed
- `pnpm --dir apps/web test` — passed (74 tests across 20 files)
- `pnpm --dir apps/web lint` — passed (0 warnings)
- `pnpm --dir apps/web build` — passed

### Security notes

- Form definitions are never publicly readable; only safe public projections are served via `/api/forms/[formId]/public`
- Form submissions can only be created by the server-side forms service using `overrideAccess: true` after full validation; the Payload collection access denies all public creates
- Webhook actions have SSRF protections: HTTPS-only, private IP ranges blocked, cloud metadata services blocked, redirects disabled, 10s timeout, 32KB payload limit
- Email actions use a stub in Phase 14; no provider credentials exist or are exposed
- Rate limiter is in-memory (single-process limitation documented); 5 submissions/form/minute per client
- Honeypot responds with fake success to avoid alerting bots
- Unknown form fields are rejected server-side with 422
- Validation errors do not leak implementation details
- No secrets are stored in submissions, audit metadata, or API responses
- All workflow results stored are safe status metadata only (no webhook responses, no raw payloads)

### Blockers

- No live DB migration file generated (requires live database connection)
- No client-side form rendering component (forms render as `data-form-slug` containers; hydration is deferred)
- Email actions are stubs; a real provider must be configured in a future phase
- Rate limiter is in-memory only; multi-process deployments require a distributed store (Redis)

### Next recommended prompt

Start Phase 15 only. Read PLAN.md, IMPLEMENTATION_STATUS.md, and `03-phases/phase-15-*` before implementing.
