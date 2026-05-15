# Phase 28 Review

## Summary

Phase 28 fixed the remaining RC web-app blockers without expanding scope:
standalone output is enabled in `apps/web/next.config.ts`, app typecheck now
runs `next typegen`, member redirect and query-string handling are hardened,
browser-only POST routes now share same-origin validation, and root prompt
artifacts were archived under `docs/agent-prompts/archive/`.

## Files Changed

- `apps/web/next.config.ts`
- `apps/web/package.json`
- `apps/web/src/lib/security/browser-post.ts`
- `apps/web/src/lib/security/browser-post.test.ts`
- `apps/web/src/lib/install/{security.ts,security.test.ts}`
- `apps/web/src/lib/members/service.ts`
- `apps/web/src/app/(public)/{login,signup,account}/page.tsx`
- `apps/web/src/app/api/members/{login,logout,profile,signup}/route.ts`
- `apps/web/src/app/api/commerce/cart/route.ts`
- `apps/web/src/app/api/commerce/cart/[cartId]/{items,checkout}/route.ts`
- `apps/web/src/app/api/templates/{import,export}/route.ts`
- `apps/web/src/app/api/templates/demo/starter-site/route.ts`
- `apps/web/src/app/api/plugins/{activate,deactivate}/route.ts`
- `apps/web/src/app/api/plugins/migrations/{plan,run}/route.ts`
- `apps/web/src/app/api/marketplace/plans/route.ts`
- `apps/web/src/migrations/{20260515_181413.ts,20260515_181413.json,index.ts}`
- `docs/runbooks/{deployment,migrations}.md`
- `docs/release/{KNOWN_LIMITATIONS.md,GO_NO_GO_CHECKLIST.md}`
- `docs/agent-prompts/archive/next-prompet-phase-13.md` through `next-prompet-phase-27.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `IMPLEMENTATION_STATUS.md`

## Docker Fixes

- `apps/web/next.config.ts` now explicitly sets `output: 'standalone'`,
  matching the Dockerfile's `.next/standalone` copy strategy.
- `apps/web/public/.gitkeep` already keeps the public directory present, and
  the deployment runbook now documents that expectation.
- Docker validation could not be run locally because `docker` is not installed
  in this environment.

## Typecheck / Typegen Fix

- `apps/web/package.json` now runs `next typegen && tsc --noEmit` for
  `typecheck`.
- Both `pnpm.cmd --dir apps/web typecheck` and root `pnpm.cmd typecheck`
  passed.

## Redirect / Message Hardening

- Sign-up `next` values remain restricted to safe relative paths only.
- Login and account pages now resolve only allowlisted query-string codes
  instead of rendering raw `error` / `success` values.

## CSRF / Origin Helper

- Added `apps/web/src/lib/security/browser-post.ts` as the shared validator for
  browser POST requests.
- Added the prompt-aligned `isSameOriginBrowserPost` and
  `assertSameOriginBrowserPost` exports on top of the shared validator and
  expanded tests to cover malformed origins.
- Applied it to member sign-up, login, logout, and profile routes.
- Applied it to member-authenticated commerce cart creation, cart item mutation,
  and checkout routes.
- Applied it to dashboard-authenticated template import/export/demo routes,
  plugin activation/deactivation/migration routes, and marketplace plan
  creation.
- Left webhook and public form submission routes unchanged because they are not
  browser-only flows.

## Migration Files Generated

- `apps/web/src/migrations/20260515_181413.ts`
- `apps/web/src/migrations/20260515_181413.json`
- `apps/web/src/migrations/index.ts`

The generated TypeScript migration needed one manual fix before it was runnable
here: `MigrateUpArgs` / `MigrateDownArgs` had to be imported as `import type`
while keeping `sql` as the runtime import from `@payloadcms/db-postgres`.

## Live DB Validation Status

- `pnpm.cmd --dir apps/web generate:types`: passed
- `pnpm.cmd --dir apps/web migrate:create`: passed
- `pnpm.cmd --dir apps/web migrate:status`: passed after the import fix and
  showed `20260515_181413` pending
- `pnpm.cmd --dir apps/web migrate`: reached the destructive warning prompt,
  accepted confirmation, then failed against the current DB because the schema
  had already been pushed in Payload dev mode and the initial migration
  collided with existing objects

## Docker Validation Status

- `docker --version`: failed because Docker is not installed
- `docker build`, `docker compose config`, and `docker compose up --build`:
  not run locally for the same reason

## Commands Run

```bash
pnpm.cmd install
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
pnpm.cmd --dir apps/web generate:types
pnpm.cmd --dir apps/web lint
pnpm.cmd --dir apps/web test
pnpm.cmd --dir apps/web typecheck
pnpm.cmd --dir apps/web build
pnpm.cmd --dir apps/web migrate:create
pnpm.cmd --dir apps/web migrate:status
'y' | pnpm.cmd --dir apps/web migrate
docker --version
```

## Remaining Blockers

- Clean production-style migration execution still needs a fresh
  migration-managed PostgreSQL database or an explicit baseline strategy for
  the current dev-pushed schema.
- Docker validation still needs a machine with Docker installed.
