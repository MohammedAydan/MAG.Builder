# Implementation Status

Project: NexPress
Mode: Greenfield
Current phase: 23-multisite-saas-readiness
Overall status: in-progress

The platform foundation, Payload CMS foundation, database/migration/seed layer, install/runtime configuration foundation, identity/RBAC/audit foundation, admin dashboard shell, public design-system shell, CMS content/media/SEO foundation, builder kernel, visual editor adapter, themes/templates foundation, plugin/module system, forms/workflows foundation, public membership/protected-route foundation, the commerce service spike, the commerce MVP slice, storefront commerce builder blocks, the API platform with OpenAPI, webhooks/integrations foundation, MCP native gateway, the search/analytics/automation foundation, and the multi-site/SaaS-readiness foundation are all implemented.

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
- [ ] Phase 24 - Marketplace, Packaging, and Updates: not-started
- [ ] Phase 25 - Observability and Security Hardening: not-started
- [ ] Phase 26 - Production Deployment and Docs: not-started
- [ ] Phase 27 - Final Release Candidate: not-started

## Current session log

### Date

2026-05-15

### Agent/tool

Codex

### Requested phase

Phase 23 - Multi-site and SaaS Readiness

### Files changed

**New files:**
- `apps/web/src/collections/Sites.ts` - hidden site model
- `apps/web/src/lib/sites/model.ts` - site constants, slug/hostname normalization, domain validation
- `apps/web/src/lib/sites/fields.ts` - reusable site relationship field helper
- `apps/web/src/lib/sites/service.ts` - default-site bootstrap, hostname resolution, site-scope helpers
- `apps/web/src/lib/sites/service.test.ts` - site resolution and isolation tests
- `docs/runbooks/multisite-saas-readiness.md`
- `plans/phase-23-multisite-saas-readiness/review.md`

**Modified files:**
- `apps/web/src/payload.config.ts` and `apps/web/src/payload-types.ts`
- `apps/web/src/collections/{Pages,Posts,Redirects,Forms,FormSubmissions,Members,CommerceCustomers,CommerceOrders}.ts`
- `apps/web/src/lib/{auth,content,forms,install,members,commerce,search,automation}/**/*`
- `apps/web/src/app/api/{forms,search,analytics}/**/*`
- `packages/search/src/{types,adapter,service,search.test.ts}`
- `packages/analytics/src/{types,adapter,service,analytics.test.ts}`
- `packages/automation/src/types.ts`
- `.env.example`

### Commands run

- `pnpm.cmd --dir apps/web generate:types` - passed
- `pnpm.cmd install` - passed
- `pnpm.cmd lint` - passed
- `pnpm.cmd typecheck` - passed
- `pnpm.cmd test` - passed
- `pnpm.cmd build` - passed
- `pnpm.cmd --dir packages/commerce lint` - passed
- `pnpm.cmd --dir packages/commerce typecheck` - passed
- `pnpm.cmd --dir packages/commerce test` - passed
- `pnpm.cmd --dir packages/commerce build` - passed
- `pnpm.cmd --dir packages/forms lint` - passed
- `pnpm.cmd --dir packages/forms typecheck` - passed
- `pnpm.cmd --dir packages/forms test` - passed
- `pnpm.cmd --dir packages/forms build` - passed
- `pnpm.cmd --dir packages/plugins lint` - passed
- `pnpm.cmd --dir packages/plugins typecheck` - passed
- `pnpm.cmd --dir packages/plugins test` - passed
- `pnpm.cmd --dir packages/plugins build` - passed
- `pnpm.cmd --dir packages/builder-core lint` - passed
- `pnpm.cmd --dir packages/builder-core typecheck` - passed
- `pnpm.cmd --dir packages/builder-core test` - passed
- `pnpm.cmd --dir packages/builder-core build` - passed
- `pnpm.cmd --dir packages/builder-editor lint` - passed
- `pnpm.cmd --dir packages/builder-editor typecheck` - passed
- `pnpm.cmd --dir packages/builder-editor test` - passed
- `pnpm.cmd --dir packages/builder-editor build` - passed
- `pnpm.cmd --dir packages/themes lint` - passed
- `pnpm.cmd --dir packages/themes typecheck` - passed
- `pnpm.cmd --dir packages/themes test` - passed
- `pnpm.cmd --dir packages/themes build` - passed
- `pnpm.cmd --dir packages/api lint` - passed
- `pnpm.cmd --dir packages/api typecheck` - passed
- `pnpm.cmd --dir packages/api test` - passed
- `pnpm.cmd --dir packages/api build` - passed
- `pnpm.cmd --dir packages/webhooks lint` - passed
- `pnpm.cmd --dir packages/webhooks typecheck` - passed
- `pnpm.cmd --dir packages/webhooks test` - passed
- `pnpm.cmd --dir packages/webhooks build` - passed
- `pnpm.cmd --dir packages/mcp-gateway lint` - passed
- `pnpm.cmd --dir packages/mcp-gateway typecheck` - passed
- `pnpm.cmd --dir packages/mcp-gateway test` - passed
- `pnpm.cmd --dir packages/mcp-gateway build` - passed
- `pnpm.cmd --dir packages/search lint` - passed
- `pnpm.cmd --dir packages/search typecheck` - passed
- `pnpm.cmd --dir packages/search test` - passed
- `pnpm.cmd --dir packages/search build` - passed
- `pnpm.cmd --dir packages/analytics lint` - passed
- `pnpm.cmd --dir packages/analytics typecheck` - passed
- `pnpm.cmd --dir packages/analytics test` - passed
- `pnpm.cmd --dir packages/analytics build` - passed
- `pnpm.cmd --dir packages/automation lint` - passed
- `pnpm.cmd --dir packages/automation typecheck` - passed
- `pnpm.cmd --dir packages/automation test` - passed
- `pnpm.cmd --dir packages/automation build` - passed
- `pnpm.cmd --dir apps/web lint` - passed
- `pnpm.cmd --dir apps/web typecheck` - passed
- `pnpm.cmd --dir apps/web test` - passed
- `pnpm.cmd --dir apps/web build` - passed

### Security notes

- Hostnames are normalized and treated as untrusted input
- `x-forwarded-host` is ignored unless `NEXPRESS_TRUST_PROXY_HOST=true`
- Reserved, malformed, private-network, and metadata-service hostnames are rejected unless explicitly development-only
- Cross-site member session reuse fails closed
- Public content, search, analytics summaries, forms, and commerce reads are site-scoped
- Site records remain hidden and not publicly writable

### Blockers

- No live DB-backed migration/backfill file is committed because Payload migration generation still requires a live database
- Legacy null-site records still rely on default-site fallback until a live backfill is executed
- Plugin activation, webhook subscriptions, and integrations remain global in Phase 23
- No billing or tenant-management UI was added in this phase

### Next recommended prompt

Start Phase 24 only. Read PLAN.md, IMPLEMENTATION_STATUS.md, and `03-phases/phase-24-*` before implementing.
