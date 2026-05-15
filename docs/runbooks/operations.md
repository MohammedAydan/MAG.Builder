# Production Operations Runbook

This guide covers daily operations, maintenance, and emergency procedures for NexPress.

## 1. Backup and Restore

### Database (PostgreSQL)

**Backup Script (Manual):**
```bash
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f nexpress_$(date +%Y%m%d_%H%M%S).dump
```

**Restore Script:**
```bash
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME -v nexpress_backup_file.dump
```

### Media Storage (S3)

Media stored in S3 should have **Versionining Enabled** at the bucket level to prevent accidental deletion.

**Replication:** Cross-region replication is recommended for high availability.

### Media Storage (Local)

If using local storage (not recommended for production), backup the `apps/web/media` directory.

```bash
tar -czvf media_backup_$(date +%Y%m%d).tar.gz apps/web/media
```

## 2. Monitoring and Health

### Endpoints

- `GET /api/health`: Returns `{"status":"ok"}`.
- `GET /api/readiness`: Returns detailed readiness status for DB and Payload.

### Log Management

NexPress uses Pino for structured JSON logging. Logs should be sent to a centralized logging system (e.g., ELK, Datadog, CloudWatch).

**Log Redaction:** Sensitive fields (passwords, tokens, emails) are redacted by the logger in `@nexpress/observability`.

## 3. Incident Response

### High Error Rate

1. Check logs for common `errorCode` values.
2. Verify database connection saturation.
3. Check external service health (Medusa, S3, etc.).
4. If a recent deployment occurred, refer to the **Rollback Checklist**.

### Database Performance Issues

1. Check for slow queries in PostgreSQL logs.
2. Verify index usage.
3. Scale database resources if necessary.

## 4. Maintenance Tasks

### Security Patching

- Run `pnpm audit` weekly.
- Update dependencies using `pnpm update`.
- Rotate `PAYLOAD_SECRET` and other keys every 90-180 days (Note: Rotating `PAYLOAD_SECRET` will invalidate existing user sessions).

### Log Rotation

If logging to local files, ensure `logrotate` is configured to prevent disk exhaustion.

### Database Vacuum

PostgreSQL `autovacuum` should be enabled. Monitor bloat periodically.

## 5. Runtime Services

### Search

- Default runtime: `NEXPRESS_SEARCH_PROVIDER=database`
- Fallback runtime: `NEXPRESS_SEARCH_PROVIDER=memory`
- Manual rebuild: `pnpm --dir apps/web reindex:search`

### Analytics

- Default runtime: `NEXPRESS_ANALYTICS_PROVIDER=audit-log`
- Test/local fallback: `NEXPRESS_ANALYTICS_PROVIDER=noop`
- Admin summary endpoint: `GET /api/analytics/summary`

### Forms

- Default rate limiting: `NEXPRESS_FORM_RATE_LIMIT_PROVIDER=memory`
- Current distributed-state status: Redis/Valkey contract exists, but no concrete client binding is shipped in this repo
- Email runtimes:
  - `NEXPRESS_EMAIL_PROVIDER=stub`
  - `NEXPRESS_EMAIL_PROVIDER=resend` with `RESEND_API_KEY` and `NEXPRESS_EMAIL_FROM`

### Webhooks

- Delivery mode: `NEXPRESS_WEBHOOK_DELIVERY_MODE=in-process`
- Retry metadata defaults:
  - `NEXPRESS_WEBHOOK_MAX_ATTEMPTS=3`
  - `NEXPRESS_WEBHOOK_BACKOFF_MS=30000`
- Current limitation: retries/backoff metadata exists at the queue boundary, but execution still runs inline in this repo
