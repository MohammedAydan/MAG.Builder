# Themes and Templates Runbook - Phase 12

## Overview

Phase 12 adds the first safe theme and template foundation for NexPress.

This phase introduces:

- a typed theme registry in `packages/themes`
- a versioned JSON template manifest schema
- server-only template import/export services in `apps/web`
- an explicit starter demo-content importer

No plugin loading, marketplace packaging, remote theme execution, or arbitrary runtime JavaScript is introduced.

## Theme registry

- Public themes are registered centrally in `packages/themes/src/registry.ts`
- Themes expose semantic token groups only: colors, layout, radius, shadow, spacing, and typography
- Public rendering resolves CSS variables through the registry and does not load dashboard, admin, or editor code
- Raw script injection, arbitrary CSS text, and remote code loading remain out of scope

## Template manifest

- Schema: `nexpress-template-manifest`
- Version: `1`
- Compatibility must declare:
  - `builderSchema: "nexpress-builder"`
  - `builderVersion: 1`
- Safe content currently supports:
  - `pages`
  - `posts`
  - `redirects`
- Protected collections are excluded:
  - `users`
  - `audit-logs`
  - `installation-state`
- Builder JSON is accepted only when it passes `@nexpress/builder-core` validation and uses registered block types only

## Import/export endpoints

Server-only route handlers are available for authenticated admin-capable users:

- `POST /api/templates/import`
- `POST /api/templates/export`
- `POST /api/templates/demo/starter-site`

These routes rely on the existing authenticated dashboard session and reject unauthenticated or underprivileged callers.

### Access and Payload Local API behavior

- Import/export checks both dashboard-admin access and content-management permission
- Standard import/export writes use Payload Local API with `overrideAccess: false`
- This preserves collection access control and avoids casually bypassing RBAC
- Audit log writes remain server-only and continue using the existing internal fail-open audit behavior

### Draft export mode

- Default export includes published content only
- Draft export requires `super-admin`
- No private drafts are exported accidentally in the default path

## Demo importer

- Starter demo content is defined in `packages/themes/src/demo.ts`
- A serializable reference manifest also exists at `templates/starter-site/template.manifest.json`
- Demo import is explicit only; it never runs automatically
- Demo content creates only allowlisted pages, posts, and redirects
- No users, secrets, credentials, or privileged system records are created

## Migrations and types

- Phase 12 does not change Payload collection shapes
- No Payload type regeneration was required
- No new live-database migration file was required

## Verification

Run from the repository root:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
