# Phase 29 Review

## Summary

Phase 29 replaced the undocumented process-local runtime assumptions with explicit runtime-service boundaries and first safe implementations:
- forms now use a `RateLimitStore` contract plus runtime-selected email providers
- search now defaults to a database-backed adapter with site-aware scoping
- analytics now default to an audit-log-backed adapter with a no-op test fallback
- automation is wired to real form, content, and commerce events
- outbound webhooks now pass through a queue abstraction with retry/backoff metadata and an in-process fallback

## Files Changed

- `packages/forms/src/{rate-limit,email,index}.ts`
- `packages/forms/src/{rate-limit,security}.test.ts`
- `packages/search/src/{types,adapter,service}.ts`
- `packages/search/src/search.test.ts`
- `packages/analytics/src/{types,analytics.test.ts}`
- `packages/automation/src/automation.test.ts`
- `packages/webhooks/src/{index,queue,queue.test.ts}`
- `apps/web/src/lib/runtime-services/{config,config.test}.ts`
- `apps/web/src/lib/forms/{runtime,service}.ts`
- `apps/web/src/app/api/forms/[formId]/submit/route.ts`
- `apps/web/src/lib/search/{database-adapter,service}.ts`
- `apps/web/src/app/api/search/route.ts`
- `apps/web/src/scripts/reindex-search.ts`
- `apps/web/src/lib/analytics/{audit-log-adapter,service}.ts`
- `apps/web/src/lib/automation/hooks.ts`
- `apps/web/src/lib/content/hooks.ts`
- `apps/web/src/collections/{Pages,Posts}.ts`
- `apps/web/src/lib/webhooks/outbound.ts`
- `apps/web/src/lib/commerce/service.ts`
- `apps/web/src/app/(public)/*/page.tsx`
- `.env.example`
- `docs/runbooks/{forms-workflows,search-analytics-automation,operations}.md`
- `docs/architecture/environment-matrix.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `IMPLEMENTATION_STATUS.md`

## Verification

Passed:
- `pnpm.cmd install`
- `pnpm.cmd lint`
- `pnpm.cmd typecheck`
- `pnpm.cmd test`
- `pnpm.cmd build`
- `pnpm.cmd --dir packages/forms test`
- `pnpm.cmd --dir packages/search test`
- `pnpm.cmd --dir packages/analytics test`
- `pnpm.cmd --dir packages/automation test`
- `pnpm.cmd --dir packages/webhooks test`
- `pnpm.cmd --dir apps/web test`
- `pnpm.cmd --dir apps/web typecheck`

## Known Gaps

- The Redis/Valkey-compatible rate-limit contract is present, but no concrete client binding is shipped yet.
- Search uses a database-backed Payload projection, not a dedicated PostgreSQL FTS index.
- Analytics persistence currently rides on audit-log summaries rather than a dedicated analytics event store.
- Webhook retry/backoff metadata exists at the queue boundary, but delivery still runs inline in this repo.
