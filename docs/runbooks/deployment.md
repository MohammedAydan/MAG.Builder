# Deployment Runbook

This guide covers the deployment of NexPress to production environments.

## Deployment Strategy

NexPress is designed for containerized deployment (Docker) or standard Node.js hosting. It uses Next.js Standalone mode for efficient production builds.

### Environment Requirements

- **Runtime:** Node.js 22+ (LTS)
- **Database:** PostgreSQL 16+
- **Storage:** Local file system (dev) or S3-compatible storage (prod)
- **Memory:** Minimum 1GB RAM recommended for build/runtime
- **Disk:** Dependent on media upload volume

## 1. Environment Variable Matrix

Refer to `docs/architecture/environment-matrix.md` for a full list of required and optional variables.

### Critical Runtime Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Used for Payload CMS encryption and authentication |
| `NEXPRESS_TRUST_PROXY_HOST` | Enables trusted forwarded-host resolution behind a reverse proxy when needed |
| `MEDUSA_SERVER_TOKEN` | Optional server-side Medusa token for advanced commerce operations |

## 2. Standard Deployment (Node.js/pnpm)

1. **Install Dependencies:**
   ```bash
   pnpm install --frozen-lockfile
   ```

2. **Build the Platform:**
   ```bash
   pnpm build
   ```

   The web app build expects Next.js standalone output. `apps/web/package.json`
   now runs `next typegen` during `typecheck`, and `apps/web/next.config.ts`
   must keep `output: 'standalone'` aligned with the Docker image layout.

3. **Run Migrations:**
   ```bash
   pnpm --dir apps/web migrate
   ```

4. **Start the Application:**
   ```bash
   pnpm --dir apps/web start
   ```

## 3. Containerized Deployment (Docker)

1. **Build the Image:**
   ```bash
   docker build -t nexpress:latest .
   ```

   The repository tracks `apps/web/public/.gitkeep` so the Docker
   `COPY apps/web/public` step remains valid even when the app has no committed
   public assets yet.

2. **Run the Container:**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL=postgres://... \
     -e PAYLOAD_SECRET=... \
     -e NEXPRESS_TRUST_PROXY_HOST=false \
     nexpress:latest
   ```

## 4. Database Migrations

Database migrations must be run during the deployment process, typically before the new version of the application becomes healthy.

### Backup Before Migration

**Always** perform a database backup before running migrations in production.

```bash
# Example PostgreSQL backup
pg_dump -U postgres -d nexpress > nexpress_backup_$(date +%Y%m%d).sql
```

### Running Migrations

```bash
pnpm --dir apps/web migrate
```

Only run production migrations after taking and verifying a backup. If the repository has no new generated migration files, document that fact in the release record rather than improvising destructive schema changes.

If the target database was previously mutated by Payload dev-mode schema pushes,
`payload migrate` will warn that data loss may occur and the generated initial
migration can fail when it tries to recreate objects that already exist.
Validate production rollouts against a clean migration-managed database or an
explicitly baselined clone instead of treating a dev-pushed schema as
production-ready.

## 5. Health and Readiness Checks

Monitoring systems should use these endpoints to determine service health:

- **Health Check:** `/api/health` - Basic uptime check.
- **Readiness Check:** `/api/readiness` - Validates database and critical config availability.

## 6. Zero-Downtime Deployment (Recommended)

1. Deploy new database migrations (ensure they are backward compatible).
2. Start new application containers.
3. Wait for `/api/readiness` to return 200.
4. Update load balancer to point to new containers.
5. Terminate old containers.

## 7. Rollback Procedure

See `docs/runbooks/rollback.md` for detailed instructions.
