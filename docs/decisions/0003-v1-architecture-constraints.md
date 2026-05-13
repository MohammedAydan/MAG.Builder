# ADR 0003 - V1 Architecture Constraints

## Status

Accepted.

## Context

NexPress v1 combines CMS, builder, commerce, APIs, and AI automation. Without explicit architecture constraints, future phases could collapse boundaries, mix unsafe extension models into the runtime, or violate the safety rules already defined in `PLAN.md`.

## Decision

Adopt the following non-negotiable v1 architecture constraints:

1. Use a monorepo with one primary `apps/web` application and domain packages for CMS, builder, plugins, themes, commerce, API contracts, MCP gateway, observability, security, auth, shared utilities, and database concerns.
2. Keep the always-on kernel small; optional domain packs must remain activatable boundaries rather than mandatory runtime load.
3. Preserve `packages/builder-core` as the source of truth for builder documents and keep public rendering independent from editor-only libraries.
4. Treat Payload as the CMS foundation, but do not let Payload internals become the only public platform API.
5. Keep commerce behind `packages/commerce` and ensure the platform works without commerce enabled.
6. Allow only local or build-time verified plugin modules in v1; no arbitrary uploaded runtime code.
7. Allow themes to provide tokens, layouts, and safe CSS-variable customization, but not arbitrary v1 JavaScript execution.
8. Expose APIs through validated route handlers and OpenAPI-aligned contracts with scopes, rate limits, and documented errors.
9. Keep MCP disabled by default and restrict tools to business-level capabilities; forbid raw shell, SQL, filesystem, and arbitrary HTTP proxy behavior.
10. Treat security, audit logs, observability, backups, migrations, and deployment readiness as product requirements, not optional polish.
11. Design for future multi-site and SaaS expansion, but do not make multi-tenant SaaS a v1 runtime requirement.

## Alternatives considered

- Use a looser architecture guide without explicit constraints
- Build commerce, plugins, or MCP directly into the web app without package boundaries
- Allow runtime plugin uploads or arbitrary theme scripts in v1 for faster extensibility

## Consequences

- The implementation path remains consistent with the product blueprint and security posture
- Some short-term implementation convenience is intentionally traded away for isolation, safety, and upgradeability
- Future changes to these constraints require ADR updates rather than silent divergence
