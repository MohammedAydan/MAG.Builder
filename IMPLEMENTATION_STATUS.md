# Implementation Status

Project: NexPress
Mode: Greenfield
Current phase: 17-commerce-mvp
Overall status: in-progress

The platform foundation, Payload CMS foundation, database/migration/seed layer, install/runtime configuration foundation, identity/RBAC/audit foundation, admin dashboard shell, public design-system shell, CMS content/media/SEO foundation, builder kernel, visual editor adapter, themes/templates foundation, plugin/module system, forms/workflows foundation, public membership/protected-route foundation, the commerce service spike, and the first commerce MVP slice are implemented. Storefront commerce blocks, broader API platform work, and MCP features remain out of scope for the current repository state.

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
- [x] Phase 16 - Commerce Service Spike: done
- [x] Phase 17 - Commerce MVP: done
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

Phase 17 - Commerce MVP

### Files changed

- `packages/commerce/src/{types.ts,index.ts,config.ts,config.test.ts,medusa.ts,medusa.test.ts,mock.ts,mock.test.ts}` - expanded the adapter contract to cover catalog, variants, carts, customers, checkout, and orders; implemented Medusa-backed and mock flows
- `apps/web/src/lib/commerce/{service.ts,service.test.ts}` - added member-aware commerce orchestration, customer mapping persistence, cart checkout flow, order snapshot persistence, and safe error handling
- `apps/web/src/app/api/commerce/**/*` - added server-side catalog, cart, checkout, and member-order route handlers
- `apps/web/src/collections/{CommerceCustomers.ts,CommerceOrders.ts}` - added hidden customer mapping storage and admin-visible order snapshots
- `apps/web/src/lib/{auth/permissions.ts,auth/access.ts,audit/service.ts}` - added commerce RBAC permissions, collection access helpers, and commerce audit actions
- `apps/web/src/{payload.config.ts,payload-types.ts}` - registered commerce collections and regenerated Payload types
- `.env.example` - added the required Medusa region and publishable-key variables for Commerce MVP
- `docs/runbooks/commerce-mvp.md`
- `plans/phase-17-commerce-mvp/review.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `IMPLEMENTATION_STATUS.md`

### Commands run

- `pnpm.cmd install`
- `pnpm.cmd lint`
- `pnpm.cmd typecheck`
- `pnpm.cmd test`
- `pnpm.cmd build`
- `pnpm.cmd --dir apps/web generate:types`
- `pnpm.cmd --dir packages/commerce lint`
- `pnpm.cmd --dir packages/commerce typecheck`
- `pnpm.cmd --dir packages/commerce test`
- `pnpm.cmd --dir packages/commerce build`
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
- `pnpm.cmd --dir apps/web lint`
- `pnpm.cmd --dir apps/web typecheck`
- `pnpm.cmd --dir apps/web test`
- `pnpm.cmd --dir apps/web build`

### Test results

- `pnpm.cmd install` - passed
- `pnpm.cmd lint` - passed
- `pnpm.cmd typecheck` - passed
- `pnpm.cmd test` - passed
- `pnpm.cmd build` - passed
- `pnpm.cmd --dir apps/web generate:types` - passed
- `pnpm.cmd --dir packages/commerce lint` - passed
- `pnpm.cmd --dir packages/commerce typecheck` - passed
- `pnpm.cmd --dir packages/commerce test` - passed (11/11 tests, 3 test files)
- `pnpm.cmd --dir packages/commerce build` - passed
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
- `pnpm.cmd --dir apps/web lint` - passed
- `pnpm.cmd --dir apps/web typecheck` - passed
- `pnpm.cmd --dir apps/web test` - passed (89/89 tests, 22 test files)
- `pnpm.cmd --dir apps/web build` - passed

### Security notes

- Commerce access remains gated server-side through `commerce-pack` capability checks and fails closed when the plugin is disabled
- Catalog routes are public-safe, while cart, checkout, and member-order flows require authenticated members and server-side validation
- Commerce runtime configuration is validated lazily inside server-side helpers; static builds do not eagerly require `MEDUSA_*` values
- `NEXT_PUBLIC_MEDUSA_SERVER_TOKEN` is rejected explicitly so provider server secrets cannot leak to the browser
- Customer mappings are persisted in a hidden collection and order snapshots are written server-side only with `overrideAccess: true`
- Commerce RBAC is explicit: only `admin` and `super-admin` can read commerce orders in admin surfaces, and direct collection mutations remain blocked
- Checkout is limited to a test-mode snapshot path only; no payment capture, tax, shipping, coupon, or inventory-sensitive logic is exposed yet

### Blockers

- No live database-backed Payload migration file was generated for the new commerce collections because migration generation still requires a live database connection
- Checkout currently persists a server-side test-mode order snapshot even if the provider cannot complete a real order
- Guest carts, storefront blocks, real payment capture, shipping, taxes, coupons, inventory sync, and webhook reconciliation remain deferred

### Next recommended prompt

Start Phase 18 only. Read PLAN.md, IMPLEMENTATION_STATUS.md, and `03-phases/phase-18-*` before implementing.

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
