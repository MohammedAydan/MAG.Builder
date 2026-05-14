# Project: NexPress

## Purpose

NexPress is a greenfield, production-grade CMS + commerce + visual-builder platform built on Next.js, Payload, and a modular package architecture with AI-safe automation boundaries.

## Current Status

- Active feature: phase-12-themes-and-templates
- Overall health: green
- Last updated: 2026-05-14

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

## Known Issues / Tech Debt

- Dependency installation and real framework scaffolding are deferred to later phases
- Root workspace quality gates now execute the real `apps/web` checks through Turbo
- v1 scope is now frozen and any expansion requires an ADR update
- Builder validation is fail-safe at render time: malformed documents fall back to the legacy page body, while unknown or invalid blocks render placeholders without crashing
- Visual editing is still draft-only after Phase 12: editor saves validate through builder-core, and public rendering still serves published content only
- No live DB-backed Payload migration file was generated for the new page builder field because migration generation still requires a live database
- Phase 12 keeps the public shell on the default registered theme; no persisted site-wide theme selector exists yet
- Template manifests package safe content references only; media binaries and relation-backed builder media imports remain out of scope
- Template import/export currently ships as server-only APIs and services without a dedicated dashboard UI
- `@measured/puck@0.20.2` is currently the editor adapter dependency even though the package is marked deprecated upstream; the kernel remains vendor-neutral and Phase 12+ can revisit the adapter choice if needed
- Package placeholders outside `apps/web`, `packages/builder-core`, `packages/builder-editor`, and `packages/themes` remain intentionally unimplemented until their phases begin

## Team / Ownership

- Product scope and ADRs: Product Architect
- Platform and monorepo boundaries: Platform Engineer
- Builder runtime and editor boundaries: Builder Engineer
- Commerce adapter boundary: Commerce Engineer
- Security controls and audit expectations: Security Reviewer
