# Phase 02 Plan

## Goal

Scaffold the real Next.js 16 application in `apps/web` with a minimal production-safe shell, App Router, Tailwind baseline, health route, and typed environment validation without implementing later platform features.

## Acceptance Criteria

- `apps/web` is a real Next.js application
- App Router structure exists with a minimal root layout and home page
- `/api/health` returns a valid JSON health response
- environment validation exists and fails safely for missing required variables
- root workspace commands run app-level `lint`, `typecheck`, `test`, and `build`
- no Phase 03 or later product logic is implemented

## Approach

Replace the placeholder app with a real Next.js scaffold, keep Server Components as the default, add a small typed env module and health route, wire root scripts through Turbo and app scripts, then verify the whole workspace from the repository root.

## Scope

In scope: Next.js app scaffold, Tailwind baseline, ESLint CLI config, typed env validation, health route, workspace scripts, and status/review updates.

Out of scope: Payload, Medusa, auth, admin features, builder logic, plugin logic, templates, themes, MCP, APIs beyond the health route, and any business/domain implementation.

## Dependencies

- `PLAN.md`
- `01-final-decision-record.md`
- `IMPLEMENTATION_STATUS.md`
- `docs/product/v1-scope.md`
- `docs/decisions/0002-v1-product-scope-freeze.md`
- `docs/decisions/0003-v1-architecture-constraints.md`
- `03-phases/phase-02-nextjs-platform-foundation/*`
- relevant files under `02-architecture/`

## Estimated Complexity

M
