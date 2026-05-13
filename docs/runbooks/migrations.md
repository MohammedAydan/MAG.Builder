# Migration and Backup Runbook — Phase 04

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
pnpm --filter @nexpress/web migrate:create
```

This generates a new timestamped migration file in `apps/web/src/migrations/`.
**Commit the generated file to source control.**

### Run pending migrations

```bash
pnpm --filter @nexpress/web migrate
```

This applies all pending migrations to the database. Safe to run in CI and production.

### Check migration status

```bash
pnpm --filter @nexpress/web migrate:status
```

### Reset database (development only)

> ⚠️ DESTRUCTIVE — drops and recreates all tables. Never run against production.

```bash
pnpm --filter @nexpress/web migrate:fresh
```

---

## Seed workflow

### Seed a local admin user

```bash
pnpm --filter @nexpress/web seed
```

Required env vars:
- `SEED_ADMIN_EMAIL` — email address for the initial admin user
- `SEED_ADMIN_PASSWORD` — password (minimum 8 characters)

The seed script is **idempotent**: if a user with the same email already exists,
no action is taken. Safe to run multiple times in local dev and CI.

In production, use the install wizard (Phase 05) instead of this script.

---

## Backup preconditions

Before running migrations against a production database:

1. **Take a full database backup** using `pg_dump` or your managed provider's
   snapshot feature before running `pnpm migrate`.
2. **Test the migration** in a staging environment first.
3. **Record the current migration status** (`pnpm migrate:status`) before and after.
4. **Never run `migrate:fresh`** in production — it destroys all data.

Example backup command:

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d%H%M%S).sql
```

---

## Environment variables summary

| Variable              | Required for           | Notes                            |
|-----------------------|------------------------|----------------------------------|
| `DATABASE_URL`        | All db operations      | PostgreSQL connection string     |
| `PAYLOAD_SECRET`      | Runtime / seed         | Strong random string             |
| `SEED_ADMIN_EMAIL`    | `pnpm seed`            | Local dev only                   |
| `SEED_ADMIN_PASSWORD` | `pnpm seed`            | Min 8 chars; local dev only      |

---

## Known limitations (Phase 04)

- No automated migration test against a real DB exists yet. An integration test
  suite using a test-scoped PostgreSQL instance is planned for a later phase.
- The seed script terminates the process after completion; this is a Payload
  Local API constraint. The `process.exit(0)` call is expected and documented.
