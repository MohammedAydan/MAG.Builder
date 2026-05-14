# Plugins and Modules Runbook - Phase 13

## Overview

Phase 13 adds the first safe local plugin/module foundation for NexPress.

This phase introduces:

- a typed plugin manifest schema in `packages/plugins`
- a centralized local allowlisted plugin registry
- explicit capability declarations and centralized capability checks
- hidden persisted activation and migration state in `plugin-states`
- server-only activation, deactivation, migration planning, and migration execution services in `apps/web`
- admin-capable route handlers for plugin operations

This phase does not add marketplace installs, remote code loading, uploaded executable plugins, third-party runtime execution, or public plugin UI.

## Local plugin model

- Only trusted local plugin definitions are registered in `packages/plugins/src/local-plugins.ts`
- Registry IDs are normalized kebab-case strings and duplicate IDs are rejected
- Plugin manifests are deterministic metadata only; they do not contain executable hooks, commands, scripts, or raw runtime config
- Optional modules are declared explicitly and can be enabled or disabled without deleting user content

## Manifest schema

- Schema id: `nexpress-plugin-manifest`
- Manifest version: `1`
- Compatibility requires:
  - `platform: "nexpress"`
  - `pluginApiVersion: 1`
- Required plugin fields include:
  - `id`
  - `name`
  - `version`
  - `description`
  - `capabilities`
  - `compatibility`
- Optional safe fields include:
  - `dependencies`
  - `conflicts`
  - `modules`
  - `migrations`
  - namespaced `metadata`

Manifest validation rejects:

- protected keys such as secrets, tokens, passwords, shell commands, scripts, hooks, `DATABASE_URL`, and `PAYLOAD_SECRET`
- unsafe HTML and executable markers
- unknown capability values
- duplicate module, migration, and dependency ids
- unknown dependency or conflict references at registry build time

## Registry and capabilities

- The registry lives in `packages/plugins/src/registry.ts`
- Available plugins are read from the local allowlist only
- Activation validation checks:
  - plugin existence
  - dependency enablement
  - declared conflicts
  - requested module ids
- Capability checks are centralized through the registry snapshot helpers; feature code should not scatter raw capability string checks

## Persisted plugin state

Plugin activation and migration metadata is stored in the hidden Payload collection:

- `plugin-states`

Stored fields include:

- `pluginId`
- `pluginVersion`
- `enabled`
- `enabledModules`
- activation/deactivation timestamps and actor relationships
- migration planning and execution status

This collection is:

- hidden from the Payload admin UI
- not publicly readable
- readable and writable only through plugin management permissions

## APIs

Server-only route handlers are available for authenticated admin-capable users:

- `GET /api/plugins`
- `POST /api/plugins/activate`
- `POST /api/plugins/deactivate`
- `POST /api/plugins/migrations/plan`
- `POST /api/plugins/migrations/run`

These routes rely on the existing dashboard session and reject unauthenticated or underprivileged callers.

## Payload Local API and `overrideAccess`

Plugin activation, deactivation, and migration writes use Payload Local API with:

- `overrideAccess: false`
- the current authenticated dashboard user

This is intentional. Plugin operations should respect normal RBAC and collection access rules.

One narrow exception exists:

- server-only capability checks may read `plugin-states` with `overrideAccess: true`

Reason:

- capability reads are internal feature-gate lookups rather than user-facing state reads
- the helper fails closed when state is missing or invalid
- the helper does not expose hidden plugin-state records to clients

## Audit behavior

Phase 13 audits:

- plugin activation
- plugin deactivation
- migration planning
- migration execution

Audit metadata records only safe identifiers, module ids, capability ids, and migration ids. No secrets or runtime config values are persisted.

## Migration foundation

- Plugin migrations are metadata-only in Phase 13
- Migrations are explicit, versioned, and tracked per plugin state record
- Unknown plugins or unknown migrations are rejected
- Destructive migrations are blocked unless explicitly confirmed
- Migration execution is server-only and admin-capable only

## Migrations and generated types

- Phase 13 adds the `plugin-states` collection, so Payload types were regenerated
- No live database-backed Payload migration file was generated in this session because migration generation still requires a live database connection
- Document the same gap in review notes until a live DB migration is created

## Verification

Run from the repository root:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
