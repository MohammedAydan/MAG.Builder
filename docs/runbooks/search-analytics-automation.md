# Search, Analytics, and Automation Runbook

## Overview

Phase 29 upgrades the Phase 22 foundations with production-oriented runtime selection:

1. **Search** (`@nexpress/search`) now supports a database-backed app adapter plus the legacy memory fallback.
2. **Analytics** (`@nexpress/analytics`) now supports an audit-log-backed app adapter plus the legacy no-op fallback.
3. **Automation** (`@nexpress/automation`) is now wired to real form, content, and commerce events.

## Search

### Runtime Options

- `NEXPRESS_SEARCH_PROVIDER=database`
  - default outside tests
  - queries published Payload-backed content directly
- `NEXPRESS_SEARCH_PROVIDER=memory`
  - development/test fallback

### Behavior

- published pages and posts are projected into safe `SearchDocument` results
- site-aware filtering is enforced
- anonymous users see only `public` content
- members can also see `members-only` content
- drafts are never returned

### Reindexing

- publish/unpublish hooks trigger `search.enqueue_reindex`
- manual rebuild: `pnpm --dir apps/web reindex:search`

### Current Limitation

The default adapter is database-backed, but it is still a Payload projection adapter rather than full PostgreSQL FTS.

## Analytics

### Runtime Options

- `NEXPRESS_ANALYTICS_PROVIDER=audit-log`
  - default outside tests
  - persists event summaries through the existing audit log collection
- `NEXPRESS_ANALYTICS_PROVIDER=noop`
  - test-safe fallback

### Event Coverage

- `page.viewed`
- `content.viewed`
- `content.published`
- `search.queried`
- `search.reindexed`
- `form.submitted`
- `commerce.order_created`

### Privacy Rules

- no passwords, tokens, secrets, API keys, raw form payloads, or payment data
- no raw IP addresses
- search query analytics are skipped when the query looks like obvious PII

### Current Limitation

The audit-log adapter is durable and useful for admin summaries, but it is not a dedicated analytics warehouse.

## Automation

### Active Trigger Wiring

- `form.submitted`
  - fired after successful form submission persistence
- `content.published`
  - fired from page/post publish hooks
- `content.unpublished`
  - fired from page/post unpublish/delete hooks
- `commerce.order_created`
  - fired after the checkout snapshot is recorded

### Built-In Rules

- `form.submitted` -> `analytics.emit_event`
- `content.published` -> `analytics.emit_event`, `search.enqueue_reindex`
- `content.unpublished` -> `search.enqueue_reindex`
- `commerce.order_created` -> `analytics.emit_event`

### Hard Boundaries

Forbidden actions remain forbidden:
`shell.exec`, `database.query`, `filesystem.read/write`, `http.fetch.arbitrary`,
`payment.charge`, `admin.role.grant`, `plugin.install.remote`, `env.read`,
`secrets.read`, `code.eval`

### Current Limitation

Automation remains static and in-process. There is still no persisted rule UI, cron layer, or background worker queue.
