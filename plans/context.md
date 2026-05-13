# Project: NexPress

## Purpose

NexPress is a greenfield, production-grade CMS + commerce + visual-builder platform built on Next.js, Payload, and a modular package architecture with AI-safe automation boundaries.

## Current Status

- Active feature: phase-05-install-wizard-runtime-config
- Overall health: green
- Last updated: 2026-05-13

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

## Known Issues / Tech Debt

- Dependency installation and real framework scaffolding are deferred to later phases
- Root workspace quality gates now execute the real `apps/web` checks through Turbo
- v1 scope is now frozen and any expansion requires an ADR update
- Package placeholders outside `apps/web` remain intentionally unimplemented until their phases begin

## Team / Ownership

- Product scope and ADRs: Product Architect
- Platform and monorepo boundaries: Platform Engineer
- Builder runtime and editor boundaries: Builder Engineer
- Commerce adapter boundary: Commerce Engineer
- Security controls and audit expectations: Security Reviewer
