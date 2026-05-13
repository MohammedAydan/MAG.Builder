# Identity, RBAC, and Audit Runbook - Phase 06

## Overview

Phase 06 adds the first production-grade identity and authorization layer for NexPress.
Payload Auth remains the authentication foundation, while NexPress now adds:

- explicit typed roles
- centralized permission helpers
- collection access rules for admin/system resources
- server-only audit logging for current critical actions

This phase does not add advanced team, organization, multisite, or public-member RBAC.

## Role model

Phase 06 defines the following v1 roles:

| Role | Purpose | Current access |
|---|---|---|
| `super-admin` | full system administrator | admin access, user management, audit-log reads, installation-state reads |
| `admin` | admin UI access without system-management privileges | admin access only |
| `editor` | authenticated non-admin content user for future phases | no admin/system access |

The role model is centralized in:

- `apps/web/src/lib/auth/roles.ts`
- `apps/web/src/lib/auth/permissions.ts`
- `apps/web/src/lib/auth/access.ts`

Do not scatter raw string role checks across the application.

## Collection protection

Payload collection access remains the main authorization layer.

### `users`

- admin route access is controlled through `access.admin`
- read/update access allows either:
  - the current user acting on their own record
  - a `super-admin`
- create/delete is restricted to `super-admin`
- the `role` field can only be changed by a `super-admin`

### `installation-state`

- hidden in admin UI
- not publicly writable
- readable only by `super-admin`

### `audit-logs`

- hidden in admin UI for now
- not publicly writable
- readable only by `super-admin`

## Audit log mechanism

Audit log storage is implemented through the hidden Payload collection:

- `audit-logs`

Audit entries include:

- actor identity when available
- actor role when available
- action name
- target collection
- target id
- result
- timestamp
- safe metadata only

Sensitive keys are stripped from metadata before persistence. This includes values such as:

- passwords
- secrets
- tokens
- cookies
- `DATABASE_URL`
- `PAYLOAD_SECRET`

## Current audited actions

Phase 06 audits the critical actions that already exist today:

- installation completion
- user create
- user update
- user delete
- successful login
- successful logout
- seeded bootstrap-user creation through the existing seed script

## Audit failure policy

Phase 06 uses a fail-open audit policy for current actions.

If audit persistence fails:

- the original write is not rolled back
- the system logs a generic server-side error message
- the error path does not include secrets or raw metadata

Reason:

- current audit hooks run after the primary write succeeds
- blocking after-hook failures would create misleading partial-failure behavior
- the current install flow already has a known non-transactional gap from Phase 05

This should be revisited in a later hardening phase with transactional or queue-backed audit guarantees.

## Local API and `overrideAccess`

Payload Local API still requires careful handling:

- if an operation should respect user permissions, use standard collection access
- bootstrap/internal operations may use `overrideAccess: true` only when explicitly justified

Current justified uses:

- install bootstrap writes
- internal audit log writes

The audit log writer is server-only and does not expose audit internals to client code.

## Verification

Run from the repository root:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
