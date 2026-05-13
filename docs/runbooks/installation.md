# Installation and Runtime Config Runbook - Phase 05

## Overview

Phase 05 adds the first-run installation foundation for NexPress. The platform now
tracks installation state server-side, exposes a dedicated `/install` entry point,
and blocks the setup flow after the initial bootstrap has completed.

This phase does not add advanced RBAC, audit logs, or deployment automation.
It establishes the secure install/runtime baseline required by later phases.

## Runtime configuration

The existing `apps/web/src/lib/env.ts` split-schema pattern remains in place:

- `buildEnv` validates only build-safe variables
- `getRuntimeEnv()` validates runtime secrets lazily inside server code paths
- `env` remains a backward-compatible proxy

Phase 05 adds these server-only variables:

| Variable | Required | Purpose |
|---|---|---|
| `NEXPRESS_INSTALLATION_MODE` | optional | `wizard` (default) or `locked` |
| `NEXPRESS_DEFAULT_SITE_NAME` | optional | prefills the install form |

`DATABASE_URL` and `PAYLOAD_SECRET` are still validated only at runtime and are never
eagerly required during static prerender.

## Installation state mechanism

Installation state is stored in the hidden Payload collection:

- `installation-state`

The collection is:

- hidden from the Payload admin UI
- denied for public CRUD access at the collection access layer
- written only by server-side install logic

The app treats the site as installed when either of the following is true:

1. an `installation-state` record exists
2. at least one admin user already exists

The second condition intentionally blocks rerunning setup against a partially
bootstrapped or previously seeded database.

## First-run flow

1. Deploy with valid runtime secrets and database access.
2. Visit `/install`.
3. Submit `siteName`, `adminEmail`, `adminPassword`, and `confirmPassword`.
4. The server validates the input and same-origin request context.
5. The server creates the first admin user.
6. The server writes the installation-state record.
7. The user is redirected to `/admin`.

After installation:

- `/install` redirects away
- `/api/install` refuses reinstall attempts
- `/` no longer exposes the setup flow

## Security notes

- No secrets are returned to the browser.
- The install page does not expose `DATABASE_URL`, `PAYLOAD_SECRET`, or raw runtime config values.
- Passwords must be at least 12 characters and include lowercase, uppercase, numeric, and symbol characters.
- The install POST route enforces a same-origin check using `Origin` and `Referer`.
- Reinstall attempts are blocked when setup is already complete.

### Payload Local API and `overrideAccess`

Phase 05 uses the Payload Local API with `overrideAccess: true` for:

- creating the first admin user
- creating the hidden installation-state record

This is intentional and narrowly scoped. Before the first install completes, there is
no authenticated admin available to satisfy normal access checks. The route remains safe because:

- it is server-only
- it validates all form input server-side
- it is blocked after installation
- the target collection is hidden and not publicly writable

Outside this bootstrap path, access control should continue to be enforced normally.

## Development notes

- `pnpm --filter @nexpress/web seed` remains available for local development.
- If the seed script has already created a user, the install wizard will be blocked intentionally.
- `NEXPRESS_INSTALLATION_MODE=locked` disables the wizard until an operator explicitly enables it again.

## Verification commands

Run from the repository root:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
