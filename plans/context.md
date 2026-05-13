# Project: NexPress

## Purpose

NexPress is a greenfield, production-grade CMS + commerce + visual-builder platform built on Next.js, Payload, and a modular package architecture with AI-safe automation boundaries.

## Current Status

- Active feature: phase-00-greenfield-bootstrap
- Overall health: green
- Last updated: 2026-05-13

## Critical Constraints

- Greenfield only; no existing application code can be assumed
- Implement one phase per session
- Phase 00 must not implement CMS, builder, commerce, MCP, or dashboard behavior
- Public rendering must remain separable from editor-only code

## Active Features

- phase-00-greenfield-bootstrap: done, initial repository scaffold and status artifacts are in place

## Known Issues / Tech Debt

- Dependency installation and real framework scaffolding are deferred to later phases
- Root quality gates are bootstrap validators until package implementations exist

## Team / Ownership

- Product scope and ADRs: Product Architect
- Platform and monorepo boundaries: Platform Engineer
- Builder runtime and editor boundaries: Builder Engineer
- Commerce adapter boundary: Commerce Engineer
- Security controls and audit expectations: Security Reviewer
