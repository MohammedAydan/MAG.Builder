# ADR 0002 - V1 Product Scope Freeze

## Status

Accepted.

## Context

NexPress needs a clear v1 boundary so implementation phases do not add features opportunistically or drift away from the production blueprint. The platform goals are broad, but the delivery target must remain explicit.

## Decision

Freeze v1 as a self-hosted, single-installation, production-oriented platform that includes:

- modular kernel foundations
- CMS pages, posts, content modeling, drafts, revisions, preview, media, menus, redirects, and SEO metadata
- an owned builder schema with validated public rendering and a visual editor adapter
- themes, templates, and local or build-time verified plugin modules
- forms, permissions, auditability, protected public routes, and documented APIs
- an optional commerce module isolated behind adapters
- an MCP gateway that is disabled by default and starts with safe business-level tools

The detailed product boundary is defined in `docs/product/v1-scope.md`.

## Alternatives considered

- Keep scope only in `PLAN.md` and phase folders
- Delay scope freeze until after platform scaffolding
- Split scope into separate per-domain ADRs before execution starts

## Consequences

- Later phases can execute with lower ambiguity and lower risk of scope drift
- Product additions beyond this boundary require an explicit ADR rather than informal expansion
- The implementation can still stage delivery by phase without weakening the final v1 contract
