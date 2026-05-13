# Implementation Status

Project: NexPress
Mode: Greenfield
Current phase: 03-payload-cms-foundation
Overall status: in-progress

Only the platform foundation and Payload CMS foundation are implemented. Auth, builder, commerce, plugin, theme, template, and MCP features remain out of scope for the current repository state.

## Phase tracker

- [x] Phase 00 - Greenfield Bootstrap: done
- [x] Phase 01 - Product Lock and ADR: done
- [x] Phase 02 - Next.js Platform Foundation: done
- [x] Phase 03 - Payload CMS Foundation: done
- [ ] Phase 04 - Database, Migrations, and Seed: not-started
- [ ] Phase 05 - Install Wizard and Runtime Config: not-started
- [ ] Phase 06 - Identity, RBAC, and Audit: not-started
- [ ] Phase 07 - Admin Dashboard Shell: not-started
- [ ] Phase 08 - Design System and Public Shell: not-started
- [ ] Phase 09 - Content, Media, and SEO: not-started
- [ ] Phase 10 - Builder Kernel: not-started
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

2026-05-13

### Agent/tool

Antigravity (Claude Sonnet)

### Requested phase

Phase 03 - Payload CMS Foundation

### Files changed

- `apps/web/package.json` — added `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `graphql`, `sharp`; added `generate:types` and `generate:importmap` scripts
- `apps/web/next.config.ts` — wrapped with `withPayload`
- `apps/web/src/payload.config.ts` — created; `buildConfig` with PostgreSQL adapter, Lexical rich-text, Users collection, security defaults
- `apps/web/src/collections/Users.ts` — created; `auth: true`, read access restricted to authenticated users
- `apps/web/src/app/(payload)/layout.tsx` — created; Payload admin layout with `handleServerFunctions` and `RootLayout`
- `apps/web/src/app/(payload)/admin/[[...segments]]/page.tsx` — created; Payload admin page with `generatePageMetadata`
- `apps/web/src/app/(payload)/admin/[[...segments]]/not-found.tsx` — created; Payload `NotFoundPage`
- `apps/web/src/app/(payload)/api/[...slug]/route.ts` — created; Payload REST/GraphQL API handler
- `apps/web/src/app/(payload)/admin/importMap.js` — generated via `generate:importmap`
- `apps/web/src/lib/env.ts` — split into `buildEnv` (eager, NODE_ENV only) and lazy Proxy `env` that calls `getRuntimeEnv()` for secrets; prevents static prerender failures
- `apps/web/src/lib/env.test.ts` — updated error message regex for new split-schema error messages
- `apps/web/vitest.config.ts` — injected `PAYLOAD_SECRET` and `DATABASE_URL` as test env vars
- `apps/web/eslint.config.mjs` — ignored `importMap.js` (generated file)
- `apps/web/.env.example` — added `PAYLOAD_SECRET` and `DATABASE_URL`

### Commands run

- `pnpm install` (dependency installation)
- `pnpm generate:importmap` (generated `importMap.js`)
- `pnpm typecheck` (tsc --noEmit)
- `pnpm lint` (eslint --max-warnings=0)
- `pnpm test` (vitest run)
- `pnpm build` (next build)

### Test results

- `pnpm typecheck` — ✅ passed (exit 0)
- `pnpm lint` — ✅ passed (exit 0, 0 warnings)
- `pnpm test` — ✅ passed (6/6 tests, 3 test files)
- `pnpm build` — ✅ passed (exit 0); routes: `/` static, `/_not-found` static, `/admin/[[...segments]]` dynamic, `/api/[...slug]` dynamic, `/api/health` dynamic

### Security notes

- Payload admin is behind Payload's own auth; no unauthenticated access to `/admin`
- `PAYLOAD_SECRET` and `DATABASE_URL` are never accessed during static prerender; only triggered inside request handlers
- `Users` collection defaults to `read: ({ req }) => !!req.user` — no anonymous read access

### Blockers

- none

### Next recommended prompt

Start Phase 04 only. Read PLAN.md, IMPLEMENTATION_STATUS.md, and 03-phases/phase-04-database-migrations-seed/* before implementing.

