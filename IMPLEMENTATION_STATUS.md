# Implementation Status

Project: NexPress
Mode: Greenfield
Current phase: 05-install-wizard-runtime-config
Overall status: in-progress

Only the platform foundation, Payload CMS foundation, database/migration/seed layer, and install/runtime configuration foundation are implemented. Auth, builder, commerce, plugin, theme, template, and MCP features remain out of scope for the current repository state.

## Phase tracker

- [x] Phase 00 - Greenfield Bootstrap: done
- [x] Phase 01 - Product Lock and ADR: done
- [x] Phase 02 - Next.js Platform Foundation: done
- [x] Phase 03 - Payload CMS Foundation: done
- [x] Phase 04 - Database, Migrations, and Seed: done
- [x] Phase 05 - Install Wizard and Runtime Config: done
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

Codex (GPT-5)

### Requested phase

Phase 05 - Install Wizard and Runtime Config

### Files changed

- `apps/web/src/collections/InstallationState.ts` - hidden installation state collection
- `apps/web/src/lib/payload.ts` - cached server-side Payload client helper
- `apps/web/src/lib/install/runtime-config.ts` - typed Phase 05 runtime config validation
- `apps/web/src/lib/install/service.ts` - install status checks, bootstrap writes, reinstall guards
- `apps/web/src/lib/install/security.ts` - same-origin protection for install POSTs
- `apps/web/src/app/install/page.tsx` - first-run setup page
- `apps/web/src/app/api/install/route.ts` - server-first install route
- `apps/web/src/app/api/install/route.test.ts` - install route smoke tests
- `apps/web/src/lib/install/runtime-config.test.ts` - runtime config tests
- `apps/web/src/lib/install/security.test.ts` - same-origin protection tests
- `apps/web/src/lib/install/service.test.ts` - install-state and bootstrap tests
- `apps/web/src/app/page.tsx` - redirects fresh installs into `/install`
- `apps/web/src/app/layout.tsx` - updated shell metadata and phase copy
- `apps/web/src/payload.config.ts` - registered the installation-state collection
- `apps/web/vitest.config.ts` - added Phase 05 test env vars
- `.env.example` - added `NEXPRESS_INSTALLATION_MODE`, `NEXPRESS_DEFAULT_SITE_NAME`
- `docs/runbooks/installation.md` - installation/runtime config runbook
- `plans/phase-05-install-wizard-runtime-config/review.md` - phase review
- `plans/context.md`
- `plans/SESSION_LOG.md`

### Commands run

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web test`

### Test results

- `pnpm install` - passed
- `pnpm lint` - passed
- `pnpm typecheck` - passed
- `pnpm test` - passed (25/25 tests, 8 test files)
- `pnpm build` - passed
- `pnpm --dir apps/web lint` - passed
- `pnpm --dir apps/web typecheck` - passed
- `pnpm --dir apps/web test` - passed

### Security notes

- `DATABASE_URL` and `PAYLOAD_SECRET` remain runtime-only validated and are not exposed to client components
- Install POST uses same-origin validation to reduce CSRF risk during first-run bootstrap
- Initial admin password is validated server-side for minimum length and character diversity
- Reinstall is blocked when an installation record or existing admin user is present
- Payload Local API uses `overrideAccess: true` only for initial bootstrap writes; this is documented in `docs/runbooks/installation.md`

### Blockers

- none

### Next recommended prompt

Start Phase 06 only. Read PLAN.md, IMPLEMENTATION_STATUS.md, and 03-phases/phase-06-identity-rbac-audit/* before implementing.
