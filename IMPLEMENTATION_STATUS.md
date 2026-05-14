# Implementation Status

Project: NexPress
Mode: Greenfield
Current phase: 13-plugin-module-system
Overall status: in-progress

The platform foundation, Payload CMS foundation, database/migration/seed layer, install/runtime configuration foundation, identity/RBAC/audit foundation, admin dashboard shell, public design-system shell, CMS content/media/SEO foundation, builder kernel, visual editor adapter, themes/templates foundation, and the first safe local plugin/module system are implemented. Commerce, APIs beyond current routes, and MCP features remain out of scope for the current repository state.

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

2026-05-15

### Agent/tool

Codex (GPT-5)

### Requested phase

Phase 13 - Plugin and Module System

### Files changed

- `packages/plugins/{package.json,README.md,tsconfig.json,vitest.config.ts}` - activated the Phase 13 plugins workspace package
- `packages/plugins/src/{types,manifest,registry,local-plugins,index}.ts` - versioned plugin manifest schema, typed capabilities, local allowlisted definitions, registry, dependency/conflict validation, and migration planning helpers
- `packages/plugins/src/{manifest,registry}.test.ts` - manifest and registry safety tests
- `apps/web/package.json` - added the `@nexpress/plugins` workspace dependency
- `apps/web/src/collections/PluginStates.ts` - protected hidden plugin activation and migration state collection
- `apps/web/src/lib/auth/{permissions,access}.ts` - centralized plugin read/manage permissions and collection access helpers
- `apps/web/src/lib/audit/service.ts` - added plugin activation/deactivation and migration audit action ids
- `apps/web/src/lib/plugins/{service,service.test}.ts` - server-only plugin activation, deactivation, migration planning/execution, capability checks, and tests
- `apps/web/src/app/api/plugins/**/*` - admin-capable plugin management route handlers
- `apps/web/src/payload.config.ts`
- `apps/web/src/payload-types.ts`
- `docs/runbooks/plugins-modules.md`
- `plans/phase-13-plugin-module-system/review.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `pnpm-lock.yaml`
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

### Security notes

- Only local allowlisted plugin definitions are registered in Phase 13; no remote loading, uploaded executable plugins, `eval`, `new Function`, or dynamic script execution paths were introduced
- Plugin manifests are versioned, validated with Zod, reject protected keys and unsafe HTML or executable markers, reject unknown capabilities, and require safe namespaced extension metadata
- Activation, deactivation, and migration execution remain server-side only and use Payload Local API writes with `overrideAccess: false` plus the authenticated dashboard user so RBAC is preserved
- Plugin state is stored in a hidden protected collection with admin-capable read/manage access only; public routes do not expose plugin internals
- Internal capability checks use a server-only fail-closed read path and do not return plugin state to clients
- Existing install, RBAC, dashboard, audit, content, builder, editor, theme, template, and public-route protections remain unchanged

### Blockers

- No live database-backed Payload migration file was generated for the new `plugin-states` collection because migration generation still requires a live database connection
- No dedicated dashboard UI exists yet for plugin management; Phase 13 ships server-only APIs and service functions only

### Next recommended prompt

Start Phase 14 only. Read PLAN.md, IMPLEMENTATION_STATUS.md, and `03-phases/phase-14-*` before implementing.
