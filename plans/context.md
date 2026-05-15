# Project: NexPress

## Purpose

NexPress is a greenfield, production-grade CMS + commerce + visual-builder platform built on Next.js, Payload, and a modular package architecture with AI-safe automation boundaries.

## Current Status

- Active feature: phase-21-mcp-native-gateway
- Overall health: green
- Last updated: 2026-05-15

## Critical Constraints

- Greenfield only; no existing application code can be assumed
- Implement one phase per session
- Phase 00 must not implement CMS, builder, commerce, MCP, or dashboard behavior
- Public rendering must remain separable from editor-only code
- Phase 02 must not introduce CMS, auth, builder, commerce, plugin, theme, template, or MCP domain logic

## Active Features

- phase-00-greenfield-bootstrap: done, initial repository scaffold and status artifacts are in place
- phase-01-product-lock-and-adr: done, v1 scope and architecture governance are locked through ADRs and product docs
- phase-02-nextjs-platform-foundation: done, `apps/web` is now a real Next.js 16 app with env validation and a health route
- phase-03-payload-cms-foundation: done, Payload CMS integrated with Next.js App Router, admin/API routes configured, Users collection, split-schema env pattern
- phase-04-database-migrations-seed: done, PostgreSQL migration workflow configured, idempotent seed script, migration/seed scripts, backup runbook
- phase-05-install-wizard-runtime-config: done, hidden installation-state model, server-only install checks, first-run `/install`, safe install POST route, install runtime runbook
- phase-06-identity-rbac-audit: done, typed role model, centralized permission helpers, protected user/admin access, hidden audit log collection, audited install and auth/user actions
- phase-07-admin-dashboard-shell: done, project-owned `/dashboard` shell, server-side route guards, permission-aware navigation, overview page, privileged settings placeholder
- phase-08-design-system-public-shell: done, centralized semantic tokens, scoped public route-group shell, reusable public primitives, and responsive homepage foundation
- phase-09-content-media-seo: done, pages/posts/media/redirect collections, published-only public content helpers, SEO metadata helpers, and sitemap/robots handlers
- phase-10-builder-kernel: done, `packages/builder-core` now owns a versioned builder schema, runtime validation, block registry, migrations, safe renderer, and core public blocks, with optional page integration and legacy body fallback in `apps/web`
- phase-11-visual-editor-adapter: done, `packages/builder-editor` now adapts the builder kernel into a protected Puck-based visual editor for page drafts, with server-side validation, autosave, and protected draft preview routes in `apps/web`
- phase-12-themes-and-templates: done, `packages/themes` now owns the typed public theme registry, safe template manifest validation, starter demo manifest, and `apps/web` now exposes server-only admin template import/export/demo flows with strict collection allowlists
- phase-13-plugin-module-system: done, `packages/plugins` now owns versioned plugin manifest validation, deterministic local registry behavior, typed capability and migration metadata, and `apps/web` now persists protected activation state with audited server-only plugin APIs
- phase-14-forms-workflows: done, `packages/forms` now owns typed form schemas, validation, rate limiting, SSRF-protected webhooks, and `apps/web` now exposes public-safe form definition/submission flows plus protected submission storage
- phase-15-membership-public-protection: done, `apps/web` now has a dedicated `members` auth collection, server-side member auth routes, a protected `/account` route, and published public content visibility rules for public vs members-only pages and posts
- phase-16-commerce-service-spike: done, `packages/commerce` now owns the typed adapter contracts, Medusa spike adapter, and lazy runtime config parsing while `apps/web` fails closed behind `commerce-pack` capability checks
- phase-17-commerce-mvp: done, commerce now exposes server-side catalog, cart, checkout, customer mapping, and member-order flows with Payload-backed admin snapshots and audit events
- phase-18-storefront-commerce-blocks: done, builder-core and builder-editor now support safe storefront commerce blocks, while `apps/web` injects NexPress-owned server rendering plus minimal client cart interactivity through existing `/api/commerce/*` routes
- phase-19-api-platform-openapi: done, `packages/api` now provides core response, rate-limit, and scope foundations, while `apps/web` exposes a static OpenAPI 3.1.1 specification document
- phase-20-webhooks-integrations: done, `packages/webhooks` now owns the typed event registry, url validation, and signature verification, while `apps/web` exposes admin-only webhook/integration collections, outbound delivery foundation, and an inbound signature verification API
- phase-21-mcp-native-gateway: done, `packages/mcp-gateway` now owns JSON-RPC routing, tool registry, and safe abstractions, while `apps/web` exposes a protected Next.js API route requiring server-side Payload authentication, strict capability/scope checks, and tool audit logs

## Known Issues / Tech Debt

- Dependency installation and real framework scaffolding are deferred to later phases
- Root workspace quality gates now execute the real `apps/web` checks through Turbo
- v1 scope is now frozen and any expansion requires an ADR update
- Builder validation is fail-safe at render time: malformed documents fall back to the legacy page body, while unknown or invalid blocks render placeholders without crashing
- Visual editing is still draft-only after Phase 13: editor saves validate through builder-core, and public rendering still serves published content only
- No live DB-backed Payload migration file was generated for the `pages.builder` field or the new `plugin-states` collection because migration generation still requires a live database
- Phase 13 ships server-only plugin APIs and services without a dedicated dashboard UI
- Local plugin definitions are metadata-only placeholders; no runtime commerce, forms, membership, or SEO feature code was introduced yet
- Internal plugin capability checks use a narrow server-only read path and fail closed; future phases can layer stronger system settings surfaces on top if needed
- Phase 15 keeps membership as a core platform feature rather than a plugin-gated runtime capability; the placeholder `membership-pack` metadata remains non-executable
- Members now use a separate HTTP-only cookie and do not share the dashboard/admin session, but password reset and email verification remain unimplemented
- Members-only content is filtered out of sitemap generation and anonymous public reads; no protected media pipeline exists yet
- Phase 17 keeps Medusa as the first provider direction and extends the boundary to catalog, carts, customer mapping, checkout snapshots, and order reads without starting storefront block work
- Commerce now fails closed unless `commerce-pack` is active and a valid server-only runtime configuration exists
- Commerce carts are member-authenticated only in Phase 17; guest carts and anonymous checkout are not implemented
- Checkout is currently a server-side test-mode order snapshot path with admin-visible `commerce-orders` persistence; real payment capture and provider-native order finalization are still incomplete
- No live DB-backed Payload migration file has been generated yet for the new `commerce-customers` and `commerce-orders` collections because migration creation still requires a live database
- Storefront catalog, product-detail, cart, and collection-list blocks now exist, but collection links are curated manually and not provider-synced
- Commerce storefront interactivity stores only a local cart id pointer in the browser; guest carts are still out of scope
- Real taxes/shipping/coupons/inventory flows and webhook-based order reconciliation remain out of scope until later phases
- `@measured/puck@0.20.2` is currently the editor adapter dependency even though the package is marked deprecated upstream; the kernel remains vendor-neutral and Phase 13+ can revisit the adapter choice if needed
- Package placeholders outside `apps/web`, `packages/builder-core`, `packages/builder-editor`, `packages/themes`, `packages/plugins`, `packages/forms`, and `packages/commerce` remain intentionally unimplemented until their phases begin

## Team / Ownership

- Product scope and ADRs: Product Architect
- Platform and monorepo boundaries: Platform Engineer
- Builder runtime and editor boundaries: Builder Engineer
- Commerce adapter boundary: Commerce Engineer
- Security controls and audit expectations: Security Reviewer
