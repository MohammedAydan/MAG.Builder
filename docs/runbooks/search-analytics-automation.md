# Search, Analytics, and Automation Runbook

## Overview

Phase 22 introduces three foundation modules:

1. **Search** (`@nexpress/search`) — In-memory adapter, replaceable via adapter pattern
2. **Analytics** (`@nexpress/analytics`) — Typed event schema, no-op adapter in Phase 22
3. **Automation** (`@nexpress/automation`) — Allowlisted trigger/action engine, synchronous execution

---

## Search

### How It Works

- Published pages and posts are indexed as `SearchDocument` projections.
- The `SearchAdapter` interface is the substitution point for external search providers.
- `SearchService` enforces access-level filtering and query validation.

### Access Control

| User type | Visible documents |
|-----------|-------------------|
| Anonymous | `accessLevel: 'public'` only |
| Authenticated member | `public` + `members-only` |
| Admin (server-side) | All (via `overrideAccess`) |

Draft content is **never** indexed or returned.

### Public API

```
GET /api/search?q=<query>&type=page|post&page=1&limit=10
```

- `q`: max 200 chars
- `limit`: max 50 per page
- Returns safe `SearchDocument` projections (id, type, title, slug, excerpt, publishedAt, accessLevel)

### In-Memory Adapter Limitations

> [!WARNING]
> The Phase 22 in-memory adapter is **not production-safe**:
> - Index is process-local and lost on restart
> - Not suitable for multi-instance deployments
> - Replace with Algolia, Typesense, or PostgreSQL FTS adapter for production

### Replacing the Adapter

1. Implement `SearchAdapter` from `@nexpress/search`
2. Update `apps/web/src/lib/search/service.ts` to use the new adapter
3. No other files need changing

### Reindexing

- Content publish events automatically trigger `search.enqueue_reindex` automation action
- Manual full reindex: call `reindexAllContent()` from `apps/web/src/lib/search/service.ts`

---

## Analytics

### How It Works

- Events are typed and versioned with `ANALYTICS_SCHEMA_VERSION = '1'`
- All events are validated server-side against a Zod discriminated union schema
- Events with sensitive field names are rejected before reaching the adapter
- The `AnalyticsAdapter` is the substitution point for external analytics providers

### Allowed Event Names

| Event | Trigger |
|-------|---------|
| `page.viewed` | Public page view |
| `content.viewed` | Content item view |
| `search.queried` | Search executed |
| `form.submitted` | Form submission outcome |
| `member.registered` | New member signup |
| `member.logged_in` | Member login |
| `commerce.product_viewed` | Product page view |
| `commerce.cart_updated` | Cart add/remove/update |
| `commerce.order_created` | Order snapshot created |

### Privacy Design

> [!IMPORTANT]
> Analytics events must never contain:
> - Passwords, secrets, tokens, API keys
> - Raw form submission payloads
> - Payment/card data
> - Private member/admin data (email, phone, address)
> - IP addresses (omitted by design)
> - User agents over 500 chars

### No-Op Adapter Limitations

> [!WARNING]
> Phase 22 uses a no-op adapter: events are **not persisted**.
> Replace with PostHog, Plausible, or a DB adapter for production analytics.

### Admin API

```
GET /api/analytics/summary?since=<ISO-date>
```
- Requires `analytics:read` or `analytics:admin` permission
- Returns aggregated event counts only — never raw event data

### Replacing the Adapter

1. Implement `AnalyticsAdapter` from `@nexpress/analytics`
2. Update `apps/web/src/lib/analytics/service.ts` to use the new adapter

---

## Automation

### How It Works

- Automation rules specify an allowlisted trigger + ordered list of allowlisted actions
- Rules are hard-coded in Phase 22 (no admin UI for rule management yet)
- Execution is synchronous and in-process
- Trigger payloads are fully validated before execution
- Action failures are isolated and never expose internal error details

### Allowed Triggers

| Trigger | Fired by |
|---------|----------|
| `form.submitted` | Form submission API |
| `content.published` | Content publish hook (manual via automation) |
| `content.unpublished` | Content unpublish hook |
| `commerce.order_created` | Commerce order snapshot |

### Allowed Actions

| Action | Effect |
|--------|--------|
| `analytics.emit_event` | Emits a typed analytics event |
| `search.enqueue_reindex` | Indexes/removes content from search index |

### Forbidden Actions (Hard Boundary)

The following actions are **never** implemented:
`shell.exec`, `database.query`, `filesystem.read/write`, `http.fetch.arbitrary`,
`webhook.send.arbitrary`, `payment.charge`, `checkout.complete`, `admin.role.grant`,
`user.impersonate`, `plugin.install.remote`, `package.install`, `env.read`,
`secrets.read`, `code.eval`

### Built-in Rules

| Rule | Trigger | Action |
|------|---------|--------|
| Track form submissions | `form.submitted` | `analytics.emit_event` |
| Update search on publish | `content.published` | `search.enqueue_reindex` |
| Remove from search on unpublish | `content.unpublished` | `search.enqueue_reindex` |
| Track order created | `commerce.order_created` | `analytics.emit_event` |

### In-Process Execution Limitation

> [!WARNING]
> Phase 22 automation is synchronous and in-process. For reliability at scale:
> - Use a background job queue (BullMQ, etc.) — Phase 25+
> - Implement retry/backoff

### Audit

Automation rule executions are written to the audit log with:
- `action: 'automation.rule.executed'`
- `metadata.ruleId`, `metadata.trigger`, `metadata.overallStatus`

---

## Migration Gap

No new Payload collections are introduced in Phase 22. No DB migrations needed.

## Known Gaps

- No admin UI for managing automation rules (Phase 25+)
- No persisted automation rule storage in Payload (Phase 25+)
- No scheduled/cron automation (Phase 25+)
- In-memory search index (replace adapter for production)
- No-op analytics adapter (replace adapter for production)
- Search index is not populated at startup; content is indexed on next publish trigger
