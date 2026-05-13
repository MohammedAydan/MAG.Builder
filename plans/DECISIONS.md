# Architecture Decisions

## ADR-001: Bootstrap Validation Scripts for Phase 00

- **Date:** 2026-05-13
- **Status:** Accepted
- **Context:** Phase 00 requires quality gates before the framework toolchain and package internals exist. The repository still needs runnable `lint`, `typecheck`, `test`, and `build` commands.
- **Decision:** Use lightweight Node-based validation scripts in `tools/scripts/` to verify repository structure, strict TypeScript config, workspace manifest shape, and status-file guardrails until later phases introduce real framework tooling.
- **Alternatives considered:** Delay scripts until Phase 02, or add full lint/build dependencies immediately.
- **Consequences:** Phase 00 stays verifiable without premature stack implementation, but these scripts are bootstrap-only and must be replaced or expanded in later phases.
---
## ADR-002: V1 Product Scope Freeze

- **Date:** 2026-05-13
- **Status:** Accepted
- **Context:** The platform goals are broad and future phases need a stable delivery boundary to avoid informal scope creep.
- **Decision:** Freeze v1 as a self-hosted, single-installation, production-oriented platform with the scope captured in `docs/product/v1-scope.md`.
- **Alternatives considered:** Keep scope implicit in `PLAN.md`, or defer scope locking until later implementation phases.
- **Consequences:** Future additions beyond the frozen boundary require explicit ADR updates instead of silent scope expansion.
---
## ADR-003: V1 Architecture Constraints

- **Date:** 2026-05-13
- **Status:** Accepted
- **Context:** The platform mixes CMS, builder, commerce, APIs, and AI automation, so boundary erosion would create security and maintenance risk.
- **Decision:** Lock the v1 architecture constraints around monorepo package boundaries, owned builder schema, commerce isolation, safe plugin and theme rules, validated APIs, and disabled-by-default MCP.
- **Alternatives considered:** Use looser guidance or allow convenience shortcuts in the app runtime.
- **Consequences:** Implementation remains aligned with `PLAN.md` and architecture docs, but some fast paths are intentionally disallowed.
---
