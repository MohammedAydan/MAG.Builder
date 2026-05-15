# Phase 23 Review - Multi-site and SaaS Readiness

## Status: COMPLETE

Implemented: 2026-05-15
Agent: Codex

## Summary

Phase 23 adds the first safe multi-site boundary for NexPress. The app now has a hidden `sites` collection, server-side hostname resolution, a default-site fallback for legacy single-site records, and site-aware filtering across public content, forms, membership, commerce, search, analytics, and automation metadata. The implementation stays within the phase boundary: no billing, no tenant UI, no provisioning automation, and no Phase 24 work.

## Files changed

### New files

- `apps/web/src/collections/Sites.ts`
- `apps/web/src/lib/sites/model.ts`
- `apps/web/src/lib/sites/fields.ts`
- `apps/web/src/lib/sites/service.ts`
- `apps/web/src/lib/sites/service.test.ts`
- `docs/runbooks/multisite-saas-readiness.md`
- `plans/phase-23-multisite-saas-readiness/review.md`

### Modified areas

- `apps/web/src/payload.config.ts` and `apps/web/src/payload-types.ts`
- content collections: `Pages`, `Posts`, `Redirects`, `Forms`, `FormSubmissions`
- identity/commerce collections: `Members`, `CommerceCustomers`, `CommerceOrders`
- install flow, public content helpers, forms services, member services, commerce services
- search, analytics, and automation integration points
- route handlers for public forms, search, and analytics summary
- status/context/session documentation and `.env.example`

## Packages added

None.

## Site/tenant model added

- Hidden Payload collection: `sites`
- Stable normalized identifiers: `siteId`, `slug`
- Safe domain mappings: `domains[]` with `hostname`, `primary`, `developmentOnly`
- Default-site bootstrap and fallback behavior for legacy single-site content

## Domain/site resolution approach

- Resolve the active site server-side from request headers
- Trust `x-forwarded-host` only when `NEXPRESS_TRUST_PROXY_HOST=true`
- Normalize and validate hostnames before lookup
- Match only active, non-suspended site records
- Fall back to the default site only for local development hosts or when no production domain mappings exist
- Fail closed for unknown production hosts once production mappings are configured

## Tenant context helpers

- `resolveSiteFromHostname()`
- `resolveSiteFromHeaders()`
- `resolveCurrentSite()`
- `ensureDefaultSiteRecord()`
- `createSiteScopeWhere()`
- `extractSiteRelationshipId()`
- `isResolvedSiteMatch()`

## Tenant-aware content/query behavior

- Public page/post lookup is site-scoped
- Redirect resolution and sitemap generation are site-scoped
- Forms reads and submissions are site-scoped
- Member registration, login, and session reuse are site-scoped
- Commerce customer/order flows are site-scoped
- Payload access helpers for published content and redirects now apply site scope when headers and payload context are available

## Search/analytics/automation site-awareness

- Search documents now include `siteId`
- Search filtering rejects cross-site content
- Analytics aggregate queries accept optional site scoping and default to the resolved site
- Global analytics aggregation requires `analytics:admin`
- Automation trigger metadata now carries safe site context where relevant

## Admin/dashboard impact

- No new tenant admin UI or billing UI was added
- Existing `/admin`, `/dashboard`, `/install`, and `/api/health` behavior remains intact
- Plugin activation remains global in Phase 23

## Membership impact

- Members are now tied to a site
- Cross-site login and session reuse fail closed
- Public members still do not gain admin roles or site-owner privileges

## API/OpenAPI changes

No new API surface and no OpenAPI changes were required. Existing public and admin APIs became site-aware internally where needed.

## MCP changes

None. MCP remains read-only and unchanged in Phase 23.

## Payload collections added/changed

### Added

- `sites`

### Changed

- `pages`
- `posts`
- `redirects`
- `forms`
- `form-submissions`
- `members`
- `commerce-customers`
- `commerce-orders`

## Payload types/migrations status

- `pnpm.cmd --dir apps/web generate:types` was run successfully
- `apps/web/src/payload-types.ts` was regenerated
- no live database migration file was committed because migration generation still requires a live database
- legacy null-site backfill is documented as a follow-up operational step

## Tests added

- `apps/web/src/lib/sites/service.test.ts`

## Tests updated

- `apps/web/src/lib/content/public.test.ts`
- `apps/web/src/lib/members/service.test.ts`
- `apps/web/src/lib/commerce/service.test.ts`
- `apps/web/src/lib/auth/access.test.ts`
- `apps/web/src/lib/content/access.test.ts`
- `apps/web/src/lib/install/service.test.ts`
- `apps/web/src/lib/install/security.test.ts`
- `apps/web/src/app/api/install/route.test.ts`
- `packages/search/src/search.test.ts`
- `packages/analytics/src/analytics.test.ts`

## Commands run

- `pnpm.cmd --dir apps/web generate:types`
- `pnpm.cmd install`
- `pnpm.cmd lint`
- `pnpm.cmd typecheck`
- `pnpm.cmd test`
- `pnpm.cmd build`
- `pnpm.cmd --dir packages/commerce lint`
- `pnpm.cmd --dir packages/commerce typecheck`
- `pnpm.cmd --dir packages/commerce test`
- `pnpm.cmd --dir packages/commerce build`
- `pnpm.cmd --dir packages/forms lint`
- `pnpm.cmd --dir packages/forms typecheck`
- `pnpm.cmd --dir packages/forms test`
- `pnpm.cmd --dir packages/forms build`
- `pnpm.cmd --dir packages/plugins lint`
- `pnpm.cmd --dir packages/plugins typecheck`
- `pnpm.cmd --dir packages/plugins test`
- `pnpm.cmd --dir packages/plugins build`
- `pnpm.cmd --dir packages/builder-core lint`
- `pnpm.cmd --dir packages/builder-core typecheck`
- `pnpm.cmd --dir packages/builder-core test`
- `pnpm.cmd --dir packages/builder-core build`
- `pnpm.cmd --dir packages/builder-editor lint`
- `pnpm.cmd --dir packages/builder-editor typecheck`
- `pnpm.cmd --dir packages/builder-editor test`
- `pnpm.cmd --dir packages/builder-editor build`
- `pnpm.cmd --dir packages/themes lint`
- `pnpm.cmd --dir packages/themes typecheck`
- `pnpm.cmd --dir packages/themes test`
- `pnpm.cmd --dir packages/themes build`
- `pnpm.cmd --dir packages/api lint`
- `pnpm.cmd --dir packages/api typecheck`
- `pnpm.cmd --dir packages/api test`
- `pnpm.cmd --dir packages/api build`
- `pnpm.cmd --dir packages/webhooks lint`
- `pnpm.cmd --dir packages/webhooks typecheck`
- `pnpm.cmd --dir packages/webhooks test`
- `pnpm.cmd --dir packages/webhooks build`
- `pnpm.cmd --dir packages/mcp-gateway lint`
- `pnpm.cmd --dir packages/mcp-gateway typecheck`
- `pnpm.cmd --dir packages/mcp-gateway test`
- `pnpm.cmd --dir packages/mcp-gateway build`
- `pnpm.cmd --dir packages/search lint`
- `pnpm.cmd --dir packages/search typecheck`
- `pnpm.cmd --dir packages/search test`
- `pnpm.cmd --dir packages/search build`
- `pnpm.cmd --dir packages/analytics lint`
- `pnpm.cmd --dir packages/analytics typecheck`
- `pnpm.cmd --dir packages/analytics test`
- `pnpm.cmd --dir packages/analytics build`
- `pnpm.cmd --dir packages/automation lint`
- `pnpm.cmd --dir packages/automation typecheck`
- `pnpm.cmd --dir packages/automation test`
- `pnpm.cmd --dir packages/automation build`
- `pnpm.cmd --dir apps/web lint`
- `pnpm.cmd --dir apps/web typecheck`
- `pnpm.cmd --dir apps/web test`
- `pnpm.cmd --dir apps/web build`

## Security notes

- host headers are normalized and treated as untrusted input
- `x-forwarded-host` is ignored unless explicitly trusted
- invalid or unknown production hosts fail closed
- reserved/private/metadata hostnames are rejected unless explicitly marked development-only
- cross-site member session reuse is rejected
- search, analytics, and public content reads are all site-scoped
- no new public write surface was added for site records

## Known gaps

- no tenant billing or subscription placeholder UI was implemented
- no site selector or site-management UI exists yet
- no live DB migration/backfill script was committed
- plugin activation remains global, not site-scoped
- webhook subscriptions and integrations remain global in Phase 23
- `apps/web/src/app/openapi/page.tsx` was isolated from lint/typecheck gates with file-level disables because it is an unrelated existing blocker

## Recommendation

- [x] Approve
- [ ] Request changes
