# Review - Phase 12: Themes and Templates

## Summary

Phase 12 activates the `@nexpress/themes` workspace package and adds the first safe theme/template foundation on top of the existing public token system and builder kernel. Public theming now resolves through a typed registry instead of an app-local token object, template manifests are validated through a versioned schema plus `@nexpress/builder-core`, and server-only import/export services enforce strict collection and field allowlists. A starter demo importer is available as an explicit admin-only action and ships with a serializable reference manifest under `templates/starter-site/`.

## Files changed

- `packages/themes/*`
- `apps/web/package.json`
- `apps/web/src/lib/design-system/{tokens,tokens.test}.ts`
- `apps/web/src/lib/audit/service.ts`
- `apps/web/src/lib/templates/{service,service.test}.ts`
- `apps/web/src/app/api/templates/**/*`
- `templates/starter-site/{package.json,README.md,template.manifest.json}`
- `docs/runbooks/themes-templates.md`
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`

## Packages added

- Local workspace package: `@nexpress/themes`

## Theme registry files added

- `packages/themes/src/registry.ts`
- `packages/themes/src/types.ts`
- `packages/themes/src/index.ts`
- `packages/themes/src/registry.test.ts`

## Template manifest files added

- `packages/themes/src/template-manifest.ts`
- `packages/themes/src/template-manifest.test.ts`
- `packages/themes/src/demo.ts`
- `templates/starter-site/template.manifest.json`

## Import/export files added

- `apps/web/src/lib/templates/service.ts`
- `apps/web/src/lib/templates/service.test.ts`
- `apps/web/src/app/api/templates/import/route.ts`
- `apps/web/src/app/api/templates/export/route.ts`

## Demo content importer files added

- `apps/web/src/app/api/templates/demo/starter-site/route.ts`
- `packages/themes/src/demo.ts`
- `templates/starter-site/template.manifest.json`

## Theme token application approach

- Public token application now resolves from the centralized theme registry in `@nexpress/themes`
- The app still applies tokens only inside the public shell boundary
- CSS variable output is deterministic and tested
- Additional compatibility variables were added safely for existing builder-core renderer classes such as `--radius-surface`, `--space-8`, `--color-surface-subtle`, `--color-border-strong`, and `--color-accent-ink`

## Payload/content integration changes

- No new Payload collections were introduced
- Template import/export is limited to `pages`, `posts`, and `redirects`
- Import constructs allowlisted data objects server-side and never forwards arbitrary manifest fields into Payload writes
- Standard writes use Payload Local API with `overrideAccess: false`
- Published-only public behavior remains unchanged

## Builder integration notes

- Template page builder documents are validated through `@nexpress/builder-core`
- Unknown or invalid builder blocks are rejected during manifest validation
- Exported manifests declare `requiredBlocks` from the builder documents they actually use

## Puck/editor impact

- None on the public renderer
- No Puck imports were added to public routes or template manifests
- Phase 12 does not change the editor adapter boundary

## Payload types/migrations status

- No collection shape changes
- No Payload type regeneration required
- No new live-DB migration file required

## Tests added

- `packages/themes/src/registry.test.ts`
- `packages/themes/src/template-manifest.test.ts`
- `apps/web/src/lib/templates/service.test.ts`
- `apps/web/src/lib/design-system/tokens.test.ts` updated for registry-backed theme resolution

## Security notes

- Theme definitions are typed token maps only; no arbitrary JavaScript execution path was introduced
- Template manifests reject raw HTML, executable content markers, protected keys, unknown block types, and invalid builder documents
- Import/export remains server-only
- Import/export access requires an authenticated admin-capable dashboard user
- Default export excludes drafts; draft export is restricted to `super-admin`
- Audit metadata records counts and identifiers only, not full manifest payloads

## Known gaps

- No site-wide persisted theme selector exists yet; the public shell uses the default registered theme
- Media binaries are not packaged in Phase 12; manifests currently export safe asset references only
- Template import/export has API endpoints and tests, but no dedicated dashboard UI yet
