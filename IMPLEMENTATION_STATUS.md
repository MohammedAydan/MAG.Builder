# Implementation Status

Project: NexPress
Mode: Greenfield
Current phase: 29-production-runtime-services
Overall status: completed

The platform foundation, Payload CMS foundation, database/migration/seed layer, install/runtime configuration foundation, identity/RBAC/audit foundation, admin dashboard shell, public design-system shell, CMS content/media/SEO foundation, builder kernel, visual editor adapter, themes/templates foundation, plugin/module system, forms/workflows foundation, public membership/protected-route foundation, the commerce service spike, the commerce MVP slice, storefront commerce builder blocks, the API platform with OpenAPI, webhooks/integrations foundation, MCP native gateway, the search/analytics/automation foundation, the multi-site/SaaS-readiness foundation, the marketplace/packaging/update-planning foundation, the security/observability hardening slice, the production deployment/docs slice, the final release-candidate validation slice, the Phase 28 RC fix pack/live DB validation slice, and the Phase 29 production runtime services slice are implemented.

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
- [x] Phase 20 - Webhooks and Integrations: done
- [x] Phase 21 - MCP Native Gateway: done
- [x] Phase 22 - Search, Analytics, and Automation: done
- [x] Phase 23 - Multi-site and SaaS Readiness: done
- [x] Phase 24 - Marketplace, Packaging, and Updates: done
- [x] Phase 25 - Observability and Security Hardening: done
- [x] Phase 26 - Production Deployment and Docs: done
- [x] Phase 27 - Final Release Candidate: done
- [x] Phase 28 - RC Fix Pack and Live DB Validation: done
- [x] Phase 29 - Production Runtime Services: done

## Current session log

### Date

2026-05-15

### Agent/tool

Codex

### Requested phase

Phase 29 - Production Runtime Services

### Files changed

**New files:**
- `apps/web/src/lib/runtime-services/{config,config.test}.ts`
- `apps/web/src/lib/forms/runtime.ts`
- `apps/web/src/lib/search/database-adapter.ts`
- `apps/web/src/lib/analytics/audit-log-adapter.ts`
- `apps/web/src/scripts/reindex-search.ts`
- `packages/webhooks/src/{queue,queue.test.ts}`
- `packages/forms/src/rate-limit.test.ts`
- `plans/phase-29-production-runtime-services/review.md`

**Modified files:**
- `apps/web/package.json`
- `apps/web/src/app/api/forms/[formId]/submit/route.ts`
- `apps/web/src/app/api/search/route.ts`
- `apps/web/src/app/(public)/[slug]/page.tsx`
- `apps/web/src/app/(public)/journal/[slug]/page.tsx`
- `apps/web/src/lib/{forms,search,analytics,automation,content,webhooks,commerce}/**/*`
- `apps/web/src/collections/{Pages,Posts}.ts`
- `packages/forms/src/{email,index,rate-limit,security.test}.ts`
- `packages/search/src/{adapter,service,types,search.test}.ts`
- `packages/analytics/src/{types,analytics.test}.ts`
- `packages/automation/src/automation.test.ts`
- `packages/webhooks/src/index.ts`
- `.env.example`
- `docs/runbooks/{forms-workflows,search-analytics-automation,operations}.md`
- `docs/architecture/environment-matrix.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `IMPLEMENTATION_STATUS.md`

### Commands run

- `pnpm.cmd install` - passed
- `pnpm.cmd lint` - passed
- `pnpm.cmd typecheck` - passed
- `pnpm.cmd test` - passed
- `pnpm.cmd build` - passed
- `pnpm.cmd --dir packages/forms test` - passed
- `pnpm.cmd --dir packages/search test` - passed
- `pnpm.cmd --dir packages/analytics test` - passed
- `pnpm.cmd --dir packages/automation test` - passed
- `pnpm.cmd --dir packages/webhooks test` - passed
- `pnpm.cmd --dir apps/web test` - passed
- `pnpm.cmd --dir apps/web typecheck` - passed

### Runtime notes

- Forms now resolve rate limiting and email delivery through runtime-selected adapters without exposing secrets to the client.
- Search now defaults to a database-backed adapter and adds a manual `reindex:search` entry point.
- Analytics now default to an audit-log-backed adapter outside tests, with `noop` retained as the test-safe fallback.
- Content publish/unpublish, form submission, and commerce checkout snapshot flows now fire automation and outbound webhook events through explicit runtime boundaries.

### Blockers

- The Redis/Valkey-compatible rate-limit contract is present, but this repo still lacks a concrete distributed client binding.
- Search is database-backed but not full PostgreSQL FTS yet.
- Analytics persistence currently uses audit-log summaries rather than a dedicated analytics warehouse.
- Webhook retry/backoff metadata exists at the queue boundary, but delivery still runs inline in this repo.

### Next recommended prompt

Phase 29 is complete. The next scoped prompt is Phase 30 admin control center unless you want to address one of the explicit runtime-service gaps first.
