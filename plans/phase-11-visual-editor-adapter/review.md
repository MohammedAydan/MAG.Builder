# Review - Phase 11: Visual Editor Adapter

## Summary

Phase 11 adds the first authenticated visual page editing workflow on top of the existing builder kernel. `packages/builder-editor` adapts `@nexpress/builder-core` into a Puck-based editor without moving schema ownership or public rendering into the editor library. `apps/web` now exposes protected dashboard routes for page draft creation, visual editing, autosave-backed draft persistence, and protected draft preview, while public routes continue rendering published content through the builder-core safe renderer.

## Files changed

- `package.json`
- `packages/builder-editor/package.json`
- `packages/builder-editor/tsconfig.json`
- `packages/builder-editor/vitest.config.ts`
- `packages/builder-editor/README.md`
- `packages/builder-editor/src/{adapter,config,editor,index,types}.ts(x)`
- `packages/builder-editor/src/{adapter,config}.test.ts(x)`
- `packages/builder-core/src/index.ts`
- `apps/web/package.json`
- `apps/web/next.config.ts`
- `apps/web/src/lib/dashboard/{access,access.test,guards,navigation}.ts`
- `apps/web/src/lib/builder/editor.ts`
- `apps/web/src/lib/builder/editor.test.ts`
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/dashboard/pages/page.tsx`
- `apps/web/src/app/dashboard/pages/[id]/builder/page.tsx`
- `apps/web/src/app/dashboard/pages/[id]/builder/styles.css`
- `apps/web/src/app/dashboard/pages/[id]/builder/save/route.ts`
- `apps/web/src/app/dashboard/pages/[id]/preview/page.tsx`
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`

## Packages added

- External package: `@measured/puck@0.20.2`
- Local workspace package: `@nexpress/builder-editor`

## Editor library integrated

- `@measured/puck` is used as the Phase 11 visual editor adapter
- The package is isolated to editor-only code paths and is not used for public rendering
- Upstream currently marks `@measured/puck@0.20.2` as deprecated; the builder kernel remains vendor-neutral so the adapter can be replaced later without changing the core schema

## Editor routes added

- `/dashboard/pages`
- `/dashboard/pages/[id]/builder`
- `/dashboard/pages/[id]/builder/save`
- `/dashboard/pages/[id]/preview`

## Adapter files added

- `packages/builder-editor/src/adapter.ts`
- `packages/builder-editor/src/types.ts`
- `apps/web/src/lib/builder/editor.ts`

## Puck/editor config files added

- `packages/builder-editor/src/config.tsx`
- `packages/builder-editor/src/editor.tsx`
- `apps/web/src/app/dashboard/pages/[id]/builder/styles.css`

## Save/load mechanism

- Draft pages are listed and created server-side through `apps/web/src/lib/builder/editor.ts`
- Builder editor loads the current `pages.builder` document, migrates it through builder-core, and converts it into editor data
- Editor saves post only editor document data to `/dashboard/pages/[id]/builder/save`
- Server-side save converts editor data back into builder-core schema, validates the document structure and block props, rejects unknown or invalid blocks, and writes only the `builder` field as a draft update
- Editor UI uses a debounced autosave plus an explicit `Save draft` action; no publish behavior was added

## Permission/route protection approach

- Dashboard entry for content work now relies on existing `content:write` permission checks
- All builder routes require an authenticated dashboard user with content-editing permission through `requireDashboardContentUser()`
- Save requests re-check permissions server-side and use authenticated Payload Local API calls with `overrideAccess: false`
- `/admin` and `/dashboard/settings` remain outside editor-role access

## Public rendering impact

- None on the rendering stack: public routes still render through `@nexpress/builder-core`
- Published-only behavior remains intact; anonymous visitors cannot see draft editor content
- Invalid or missing builder documents still fail safely and fall back through the existing public rendering path

## Payload/content integration changes

- No new Payload collections were added
- Phase 11 works against the existing optional `pages.builder` field introduced in Phase 10
- Draft preview uses the existing page content rendering helper behind authenticated dashboard access

## Payload types/migrations status

- Payload types were not regenerated because Phase 11 did not change collection shapes
- No Payload migration file was generated; the previously documented live-DB migration gap for the `pages.builder` field remains unchanged

## Tests added

- `packages/builder-editor/src/adapter.test.ts`
- `packages/builder-editor/src/config.test.tsx`
- `apps/web/src/lib/builder/editor.test.ts`
- `apps/web/src/lib/dashboard/access.test.ts` updated for content-editor dashboard access

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
- `pnpm --dir packages/builder-editor lint`
- `pnpm --dir packages/builder-editor typecheck`
- `pnpm --dir packages/builder-editor test`
- `pnpm --dir packages/builder-editor build`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web build`

## Security notes

- Public rendering remains builder-core-only; no Puck code is imported into public routes
- No secrets or runtime config were exposed to client editor components
- Save requests accept only editor data, not arbitrary Payload fields or system fields
- Builder data is server-side migrated and validated before persistence
- Unknown and invalid blocks do not crash the editor load path or the public renderer
- Draft preview is protected and does not expose unpublished content anonymously

## Known gaps

- Phase 11 does not add publish workflow UI, revision history, collaboration, templates, themes, or plugin loading
- Builder media blocks still rely on validated URL props; relation-backed media resolution inside builder JSON remains deferred
- `@measured/puck@0.20.2` is deprecated upstream, so the adapter choice should be revisited in a later phase if the project standard changes
