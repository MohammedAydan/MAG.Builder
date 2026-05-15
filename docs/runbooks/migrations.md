# Migration and Backup Runbook

## Overview

This runbook documents how to run Payload CMS migrations and seed the database
for the NexPress platform. All commands run against `apps/web` via package scripts.

---

## Prerequisites

- PostgreSQL 15+ running and accessible at `DATABASE_URL`
- `PAYLOAD_SECRET` set to a strong random string
- `NODE_ENV` set appropriately (`development` or `production`)

---

## Migration workflow

### Create a new migration

> Run after changing a Payload collection schema.

```bash
pnpm --dir apps/web migrate:create
```

This generates a new timestamped migration file in `apps/web/src/migrations/`.
Commit the generated file to source control.

Phase 28 generated `apps/web/src/migrations/20260515_181413.ts` and the
companion snapshot JSON against a real PostgreSQL-backed environment.

If Payload emits `MigrateUpArgs` / `MigrateDownArgs` as value imports from
`@payloadcms/db-postgres`, convert them to `import type` and keep `sql` as the
runtime import. The generated file in this repo required that fix before
`migrate:status` could load it.

### Run pending migrations

```bash
pnpm --dir apps/web migrate
```

This applies all pending migrations to the database.

If the target database already contains schema changes pushed in Payload dev
mode, the CLI will warn that data loss may occur and the run can fail because
the migration tries to create tables or types that already exist. Use a clean
production-like database or baseline the existing schema before treating the
migration run as valid.

### Check migration status

```bash
pnpm --dir apps/web migrate:status
```

### Reset database (development only)

> Destructive. Never run against production.

```bash
pnpm --dir apps/web migrate:fresh
```

---

## Seed workflow

### Seed a local admin user

```bash
pnpm --filter @nexpress/web seed
```

Required env vars:

- `SEED_ADMIN_EMAIL` - email address for the initial admin user
- `SEED_ADMIN_PASSWORD` - password (minimum 8 characters)

The seed script is idempotent: if a user with the same email already exists, no
action is taken. Safe to run multiple times in local dev and CI.

In production, use the install wizard (Phase 05) instead of this script.

---

## Backup preconditions

Before running migrations against a production database:

1. Take a full database backup using `pg_dump` or your managed provider's
   snapshot feature before running `pnpm migrate`.
2. Test the migration in a staging environment first.
3. Record the current migration status (`pnpm migrate:status`) before and after.
4. Never run `migrate:fresh` in production because it destroys all data.
5. Prefer a clean migration-managed validation DB for release checks. A
   long-lived dev database that has already been schema-pushed is not a valid
   substitute for migration execution testing.

Example backup command:

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d%H%M%S).sql
```

---

## Environment variables summary

| Variable | Required for | Notes |
|---|---|---|
| `DATABASE_URL` | All db operations | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Runtime / seed | Strong random string |
| `SEED_ADMIN_EMAIL` | `pnpm seed` | Local dev only |
| `SEED_ADMIN_PASSWORD` | `pnpm seed` | Min 8 chars; local dev only |

---

## Phase 28 validation notes

- `pnpm --dir apps/web generate:types` passed.
- `pnpm --dir apps/web migrate:create` passed.
- `pnpm --dir apps/web migrate:status` passed after fixing the generated
  migration import style and showed the new migration as pending.
- `pnpm --dir apps/web migrate` reached the destructive warning prompt and,
  after confirmation, failed against the current validation DB because the
  schema had already been pushed in dev mode and the initial migration collided
  with existing objects.
- The seed script still terminates the process after completion; this is a
  Payload Local API constraint. The `process.exit(0)` call is expected and
  documented.
