# Multi-site and SaaS Readiness Runbook

## Overview

Phase 23 adds the first server-side multi-site foundation for NexPress. The implementation introduces:

- a hidden `sites` Payload collection
- normalized site ids and slugs
- normalized domain mappings with safe validation
- server-side hostname resolution
- site-aware query helpers for public content, forms, members, commerce, search, analytics, and automation context

This phase is a boundary and isolation foundation only. It does not add billing, subscriptions, org/team UI, tenant provisioning automation, custom domain verification, or marketplace features.

## Site Model

The `sites` collection stores:

- `siteId`: stable normalized identifier
- `slug`: unique normalized site slug
- `name`: human-readable label
- `status`: `active` or `suspended`
- `isDefault`: marks the single-site fallback record
- `domains[]`: normalized hostname mappings with optional `developmentOnly`

The collection is hidden and not publicly writable.

## Default Site Behavior

Existing single-site content is handled through a safe default-site contract:

- install now creates a default `sites` record
- if a site-aware record has no `site` relation yet, default-site queries treat that content as belonging to the default site
- if no `sites` record exists yet, the site service lazily creates the default record using install state for naming

This preserves pre-Phase 23 behavior while allowing future backfill of legacy documents.

## Host Resolution

Site resolution is server-side only.

Resolution rules:

1. Read `host` by default.
2. Read `x-forwarded-host` only when `NEXPRESS_TRUST_PROXY_HOST=true`.
3. Normalize the hostname before lookup.
4. Match against active non-suspended site records.
5. If no explicit mapping matches:
   - use the default site for local development hosts
   - use the default site when no production domain mappings exist yet
   - otherwise fail closed and return no site

This avoids trusting arbitrary client-supplied site ids and avoids unsafe forwarded-host behavior by default.

## Domain Validation Rules

Site domains are normalized and validated with a fail-closed policy.

Rejected by default:

- malformed hostnames
- reserved/internal hostnames
- localhost-style hosts in production mappings
- private-network and metadata-service targets

Allowed only when `developmentOnly=true`:

- localhost
- loopback-style development hosts

Do not use public site mappings to point at private infrastructure or metadata addresses.

## Tenant-aware Querying

Use `createSiteScopeWhere(site)` for Payload queries that must remain site-bound.

Current site-aware areas:

- published page queries
- published post queries
- redirects
- sitemap generation
- public forms and submissions
- member registration and login/session validation
- commerce customer and order lookups
- search indexing and search reads
- analytics aggregate summaries
- automation trigger metadata

Cross-site access fails closed. Unknown or mismatched site relations are rejected outside the default-site fallback path.

## Membership and Commerce Scope

Members are now site-scoped:

- registration stores the resolved site
- login rejects cross-site member access
- session reads clear invalid cross-site sessions

Commerce records are also site-scoped:

- commerce customer mappings persist `site`
- commerce orders persist `site`
- member order/cart flows require a site-scoped member context

## Analytics and Search Scope

Search documents now carry `siteId`, and search responses are filtered by the resolved site.

Analytics aggregates now accept optional site scoping. The admin summary endpoint:

- scopes to the resolved site by default
- permits `scope=global` only for `analytics:admin`

Automation hooks forward safe site context only:

- `siteId`
- `siteSlug` when available in the validated trigger payload

## Admin and System Surface

Phase 23 does not add a tenant admin UI or billing UI.

Current admin/system impact:

- Payload admin remains available
- `/dashboard`, `/install`, `/api/health`, and existing system routes continue to work
- site resolution does not require eager runtime-secret validation during build
- plugin state remains global in Phase 23; no site-scoped plugin activation was introduced

## Environment

New optional variable:

```env
NEXPRESS_TRUST_PROXY_HOST=false
```

Set this to `true` only when NexPress is deployed behind a trusted proxy that correctly sets `x-forwarded-host`.

## Migration Gap

Phase 23 adds new site relationships to several collections, but no live database migration file is committed because migration generation still requires a live database connection.

Legacy content backfill plan:

1. Generate a Payload migration against a live database.
2. Create or verify the default `sites` record.
3. Backfill null `site` relations on legacy docs to the default site.
4. Re-run verification after backfill.

Until that backfill exists, default-site reads intentionally treat missing site relations as belonging to the default site only.

## Known Gaps

- no billing or subscription foundation beyond documented SaaS boundaries
- no tenant provisioning automation
- no site selector or site-management UI
- no live DB migration/backfill script committed yet
- plugin activation remains global rather than site-scoped
- site scoping has not been extended to webhook subscriptions or integrations in Phase 23
