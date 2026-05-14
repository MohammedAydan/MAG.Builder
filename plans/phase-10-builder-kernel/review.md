# Review - Phase 10: Builder Kernel

## Summary

Phase 10 establishes the first owned NexPress builder kernel in `packages/builder-core`. The phase adds a versioned builder document schema, structural and registry-aware runtime validation, deterministic schema migration helpers, a centralized typed block registry, safe core public blocks, and a server-safe renderer that degrades cleanly for unknown or invalid blocks. `apps/web` now integrates the kernel only where needed by adding an optional validated `builder` field to pages and rendering it publicly with a legacy `body` fallback.

## Files changed

- `packages/builder-core/package.json`
- `packages/builder-core/tsconfig.json`
- `packages/builder-core/vitest.config.ts`
- `packages/builder-core/README.md`
- `packages/builder-core/src/blocks/core-blocks.tsx`
- `packages/builder-core/src/{index,migrations,registry,renderer,schema,types,url,validation}.ts(x)`
- `packages/builder-core/src/{schema,migrations,registry,renderer}.test.ts(x)`
- `apps/web/package.json`
- `apps/web/next.config.ts`
- `apps/web/vitest.config.ts`
- `apps/web/src/collections/Pages.ts`
- `apps/web/src/lib/builder/kernel.ts`
- `apps/web/src/lib/content/public.ts`
- `apps/web/src/lib/content/rendering.ts`
- `apps/web/src/lib/content/rendering.test.tsx`
- `apps/web/src/app/(public)/[slug]/page.tsx`
- `apps/web/src/payload-types.ts`
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`

## Packages added

- No new external packages were added.
- `apps/web` now depends on the local workspace package `@nexpress/builder-core`.

## Builder schema files added

- `packages/builder-core/src/types.ts`
- `packages/builder-core/src/schema.ts`
- `packages/builder-core/src/validation.ts`
- `packages/builder-core/src/url.ts`

## Block registry files added

- `packages/builder-core/src/registry.ts`
- `packages/builder-core/src/blocks/core-blocks.tsx`

## Renderer files added

- `packages/builder-core/src/renderer.tsx`
- `apps/web/src/lib/content/rendering.ts`

## Core blocks added

- `core.section`
- `core.heading`
- `core.text`
- `core.image`
- `core.button`

## Schema migration helpers added

- `packages/builder-core/src/migrations.ts`
- deterministic legacy v0-to-v1 mapper for `content/config/items` -> `blocks/props/children`

## Payload/content integration changes

- Added an optional `builder` JSON field to `pages`
- Kept `body` required for backwards-compatible fallback rendering
- Public page rendering now prefers validated builder content and falls back to `body` when builder JSON is missing or structurally invalid
- Posts, redirects, robots, sitemap, dashboard, install, and admin routes were left unchanged

## Payload types/migrations status

- Payload types were regenerated into `apps/web/src/payload-types.ts`
- No Payload migration file was generated or committed because migration generation still requires a live database

## Tests added

- `packages/builder-core/src/schema.test.ts`
- `packages/builder-core/src/migrations.test.ts`
- `packages/builder-core/src/registry.test.ts`
- `packages/builder-core/src/renderer.test.tsx`
- `apps/web/src/lib/content/rendering.test.tsx`

## Commands run

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

## Security notes

- Builder documents remain serializable JSON only and do not execute code
- Public page reads still rely on `overrideAccess: false`, so draft builder content is not exposed publicly
- Unknown blocks and invalid block props degrade safely instead of crashing the page
- Image and button URLs are validated before rendering
- No admin, dashboard, install, audit, user, or runtime-secret data was added to the public bundle

## Known gaps

- No visual editor adapter, drag-and-drop UI, preview tooling, or autosave workflow was added; that remains Phase 11+
- The image block currently renders from validated safe URLs inside builder JSON; relation-backed media resolution inside builder documents is still deferred
- No live database migration file was generated for the new page builder field because a live DB was not available
