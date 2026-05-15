# Implementation Status

Project: NexPress
Mode: Greenfield
Current phase: 19-api-platform-openapi
Overall status: in-progress

The platform foundation, Payload CMS foundation, database/migration/seed layer, install/runtime configuration foundation, identity/RBAC/audit foundation, admin dashboard shell, public design-system shell, CMS content/media/SEO foundation, builder kernel, visual editor adapter, themes/templates foundation, plugin/module system, forms/workflows foundation, public membership/protected-route foundation, the commerce service spike, the commerce MVP slice, and storefront commerce builder blocks are implemented. Broader API platform work and MCP features remain out of scope for the current repository state.

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
- [x] Phase 18 - Storefront Commerce Blocks: done
- [x] Phase 19 - API Platform and OpenAPI: done
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

Phase 19 - API Platform and OpenAPI

### Files changed

- `packages/api/package.json` - created `@nexpress/api` platform module
- `packages/api/tsconfig.json`
- `packages/api/vitest.config.ts`
- `packages/api/src/responses.ts` - added standard API response/error helper contracts
- `packages/api/src/rate-limit.ts` - added common rate limit interface and memory implementation
- `packages/api/src/scopes.ts` - added API scope foundation definitions
- `packages/api/src/openapi.ts` - added static OpenAPI 3.1.1 document generator
- `packages/api/src/index.ts`
- `packages/api/src/*.test.ts` - test coverage for all new api platform modules
- `apps/web/package.json` - added `@nexpress/api` dependency
- `apps/web/src/app/api/openapi.json/route.ts` - added static OpenAPI endpoint
- `plans/phase-19-api-platform-openapi/review.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `IMPLEMENTATION_STATUS.md`

### Commands run

- `pnpm install`
- `pnpm --dir packages/api test`
- `pnpm check`

### Test results

- `packages/api` test passed (8/8 tests, 4 test files)
- Root checks passed

### Security notes

- The API platform package provides strict typing for responses, preventing accidental data leaks.
- Rate limiting foundation ensures uniform abuse control interfaces.
- OpenAPI explicitly documents security schemes without exposing raw credentials or secrets.
- `openapi.json` route is fully static and does not execute untrusted client-side code.

### Blockers

- Fully integrated API Keys are deferred until explicit implementation.

### Next recommended prompt

Start Phase 20 only. Read PLAN.md, IMPLEMENTATION_STATUS.md, and `03-phases/phase-20-*` before implementing.

---

## Phase 18 - Storefront Commerce Blocks

Status: done
Implemented: 2026-05-15

### Files added

- `packages/builder-core/src/{blocks/core-blocks.tsx,index.ts,types.ts}`
- `packages/builder-core/src/{renderer.test.tsx,schema.test.ts}`
- `packages/builder-editor/src/{config.tsx,config.test.tsx,adapter.test.ts}`
- `apps/web/src/lib/commerce/{service.ts,service.test.ts,storefront.ts}`
- `apps/web/src/components/commerce/{storefront-add-to-cart.tsx,storefront-cart.tsx,storefront-blocks.tsx}`
- `apps/web/src/lib/content/{rendering.ts,rendering.test.tsx}`
- `apps/web/src/app/{(public)/[slug]/page.tsx,dashboard/pages/[id]/preview/page.tsx}`
- `docs/runbooks/commerce-mvp.md`
- `plans/phase-18-storefront-commerce-blocks/review.md`

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
