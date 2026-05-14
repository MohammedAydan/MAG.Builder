# Review - Phase 13: Plugin and Module System

## Summary

Phase 13 activates `@nexpress/plugins` as the first safe plugin/module boundary for NexPress and adds a protected app-side persistence and service layer around it. Plugin manifests are now versioned and validated, local plugin definitions are registered through a deterministic central registry, capability checks and module toggles are centralized, and plugin migration planning/execution metadata is tracked in a hidden Payload collection. Activation, deactivation, migration planning, and migration execution all ship as server-only audited flows.

## Files changed

- `packages/plugins/*`
- `apps/web/package.json`
- `apps/web/src/collections/PluginStates.ts`
- `apps/web/src/lib/auth/{permissions,access}.ts`
- `apps/web/src/lib/audit/service.ts`
- `apps/web/src/lib/plugins/{service,service.test}.ts`
- `apps/web/src/app/api/plugins/**/*`
- `apps/web/src/payload.config.ts`
- `apps/web/src/payload-types.ts`
- `docs/runbooks/plugins-modules.md`
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `pnpm-lock.yaml`

## Packages added

- Local workspace package: `@nexpress/plugins`

## Plugin packages/modules added

- Central local allowlist definitions:
  - `blog-pack`
  - `commerce-pack`
  - `forms-pack`
  - `membership-pack`
  - `seo-pack`
- Optional modules are declared per plugin inside the manifest registry and can be toggled independently of plugin activation state

## Manifest schema files added

- `packages/plugins/src/types.ts`
- `packages/plugins/src/manifest.ts`
- `packages/plugins/src/manifest.test.ts`

## Registry files added

- `packages/plugins/src/registry.ts`
- `packages/plugins/src/local-plugins.ts`
- `packages/plugins/src/registry.test.ts`
- `packages/plugins/src/index.ts`

## Activation/deactivation mechanism

- Hidden persisted state lives in the new `plugin-states` collection
- Activation and deactivation run through `apps/web/src/lib/plugins/service.ts`
- Both operations are server-only, admin-capable only, and use Payload Local API writes with `overrideAccess: false`
- Activation is idempotent when the plugin is already enabled with the same modules and version
- Deactivation preserves migration metadata and does not delete user content

## Capability checks added

- Explicit capability allowlist in `packages/plugins/src/types.ts`
- Registry-backed capability resolution in `packages/plugins/src/registry.ts`
- Server-only fail-closed capability helper in `apps/web/src/lib/plugins/service.ts`
- Optional module capabilities are only present when the module is enabled

## Plugin migration foundation

- Manifest-declared migration metadata is versioned and validated
- Migration plans are derived from manifest metadata plus persisted plugin-state records
- Execution tracks `pending` and `applied` status per migration
- Unknown plugins and unknown migration ids are rejected
- Destructive migrations require explicit confirmation and are blocked by default

## Payload/content/builder/theme integration changes

- Added hidden `plugin-states` collection only
- Existing `pages`, `posts`, `media`, and `redirects` access behavior is unchanged
- No plugin code was imported into public rendering
- `@nexpress/builder-core`, `@nexpress/builder-editor`, and `@nexpress/themes` boundaries remain intact

## Access-control changes

- Added centralized `plugins:read` and `plugins:manage` permissions
- `admin` and `super-admin` can manage plugin state
- `editor` remains excluded from plugin-management access
- Route handlers rely on the existing dashboard session and reject underprivileged users

## Payload types/migrations status

- Payload types were regenerated because `plugin-states` was added
- No live DB-backed Payload migration file was generated because migration generation still requires a live database connection

## Tests added

- `packages/plugins/src/manifest.test.ts`
- `packages/plugins/src/registry.test.ts`
- `apps/web/src/lib/plugins/service.test.ts`

## Commands run

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

## Security notes

- Plugin manifests are treated as untrusted input even though they are local
- No remote loading, uploaded executable plugins, shell commands, `eval`, `new Function`, or manifest-provided scripts/hooks are allowed
- Manifest metadata supports future extension only through safe namespaced keys
- Hidden plugin-state data is never publicly readable
- Capability checks fail closed when a plugin is missing, disabled, or invalid
- Audit entries record safe metadata only

## Known gaps

- No dashboard UI exists yet for plugin management; Phase 13 intentionally ships service and API foundations only
- Local plugin definitions are metadata-only placeholders for future feature phases; no commerce, forms, membership, or SEO runtime features were implemented here
- No live DB-backed Payload migration file was generated in this session
