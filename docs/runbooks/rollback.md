# Rollback Runbook

This guide covers how to revert a failed deployment of NexPress.

## 1. Decision Criteria

Revert if any of the following conditions persist for more than 5-10 minutes post-deploy:
- High error rate (>5% of requests).
- Database migration failure or data corruption.
- Critical path broken (Login, Checkout, Home).
- `/api/readiness` remains failing.

## 2. Reverting Application Code

### Containerized (Docker)

Re-deploy the previous image tag.

```bash
# Example: Deploying version 1.2.3 instead of 1.2.4
docker pull nexpress:1.2.3
docker run ... nexpress:1.2.3
```

### Manual (pnpm)

1. Checkout the previous git tag/commit.
2. Re-run `pnpm build`.
3. Restart the server.

## 3. Reverting Database Migrations

**Warning:** Reverting migrations can lead to data loss if new columns contained data from the failed deployment.

### Revert the last migration

```bash
# Use Payload CMS migration tool if it supports down migrations
# Note: Many production environments prefer rolling forward or restoring from backup
pnpm --dir apps/web migrate:down
```

### Restore from Backup (Last Resort)

If the database is corrupted or the migration cannot be cleanly reverted:

1. Stop the application server.
2. Restore the database from the backup taken immediately before the deployment.
3. Restart the application server using the previous version code.

## 4. Communication

1. Notify the team and stakeholders of the rollback.
2. Update the status page (if available).
3. Conduct a Post-Mortem to identify the root cause.
