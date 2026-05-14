# Implementation Status

Project: NexPress
Mode: Greenfield
Current phase: 10-builder-kernel
Overall status: in-progress

The platform foundation, Payload CMS foundation, database/migration/seed layer, install/runtime configuration foundation, identity/RBAC/audit foundation, admin dashboard shell, public design-system shell, CMS content/media/SEO foundation, and the first owned builder kernel are implemented. Visual editor adaptation, themes/templates, plugin loading, commerce, and MCP features remain out of scope for the current repository state.

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
- [ ] Phase 11 - Visual Editor Adapter: not-started
- [ ] Phase 12 - Themes and Templates: not-started
- [ ] Phase 13 - Plugin and Module System: not-started
- [ ] Phase 14 - Forms and Workflows: not-started
- [ ] Phase 15 - Public Membership and Protected Routes: not-started
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

2026-05-14

### Agent/tool

Codex (GPT-5)

### Requested phase

Phase 10 - Builder Kernel

### Files changed

- `packages/builder-core/{package.json,tsconfig.json,vitest.config.ts,README.md}` - activated the Phase 10 builder-core workspace package
- `packages/builder-core/src/{types,schema,migrations,registry,renderer,url,index}.ts(x)` - versioned builder schema, migrations, registry, URL guards, and server-safe renderer
- `packages/builder-core/src/blocks/core-blocks.tsx` - safe core section, heading, text, image, and button blocks
- `packages/builder-core/src/*.test.ts(x)` - schema, migration, registry, and renderer unit tests
- `apps/web/src/collections/Pages.ts` - optional validated builder JSON field while preserving the legacy body field
- `apps/web/src/lib/builder/kernel.ts` - web-facing builder validation and public registry wiring
- `apps/web/src/lib/content/{public,rendering}.ts` - published page builder support with legacy body fallback
- `apps/web/src/lib/content/rendering.test.tsx` - public rendering compatibility tests
- `apps/web/src/app/(public)/[slug]/page.tsx` - page route now renders validated builder content safely when present
- `apps/web/src/payload-types.ts` - regenerated Payload collection types for the new page builder field
- `apps/web/{package.json,next.config.ts,vitest.config.ts}` - workspace dependency, package transpilation, and test discovery updates
- `plans/phase-10-builder-kernel/review.md` - phase review
- `plans/context.md`
- `plans/SESSION_LOG.md`

### Commands run

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm --dir packages/builder-core lint`
- `pnpm --dir packages/builder-core typecheck`
- `pnpm --dir packages/builder-core test`
- `pnpm --dir packages/builder-core build`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/web generate:types`

### Test results

- `pnpm install` - passed
- `pnpm lint` - passed
- `pnpm typecheck` - passed
- `pnpm test` - passed (60/60 tests, 20 test files across `apps/web` and `packages/builder-core`)
- `pnpm build` - passed
- `pnpm --dir packages/builder-core lint` - passed
- `pnpm --dir packages/builder-core typecheck` - passed
- `pnpm --dir packages/builder-core test` - passed (9/9 tests, 4 test files)
- `pnpm --dir packages/builder-core build` - passed
- `pnpm --dir apps/web lint` - passed
- `pnpm --dir apps/web typecheck` - passed
- `pnpm --dir apps/web test` - passed (51/51 tests, 16 test files)
- `pnpm --dir apps/web build` - passed
- `pnpm --dir apps/web generate:types` - passed

### Security notes

- Builder documents are versioned JSON only; no eval, dynamic imports, arbitrary code execution, or raw HTML rendering paths were added
- Public page reads still use collection access control plus `overrideAccess: false`, so draft builder content remains private with the page draft
- Unknown blocks and invalid block props render safe placeholders or fall back to the legacy body content rather than crashing public pages
- Link and image block URLs are validated against safe relative/absolute protocols before rendering
- Existing install, RBAC, dashboard, audit, content, redirect, and media protections remain unchanged

### Blockers

- none

### Next recommended prompt

Start Phase 11 only. Read PLAN.md, IMPLEMENTATION_STATUS.md, and 03-phases/phase-11-visual-editor-adapter/* before implementing.
