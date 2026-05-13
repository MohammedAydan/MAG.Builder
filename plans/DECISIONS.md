# Architecture Decisions

## ADR-001: Bootstrap Validation Scripts for Phase 00

- **Date:** 2026-05-13
- **Status:** Accepted
- **Context:** Phase 00 requires quality gates before the framework toolchain and package internals exist. The repository still needs runnable `lint`, `typecheck`, `test`, and `build` commands.
- **Decision:** Use lightweight Node-based validation scripts in `tools/scripts/` to verify repository structure, strict TypeScript config, workspace manifest shape, and status-file guardrails until later phases introduce real framework tooling.
- **Alternatives considered:** Delay scripts until Phase 02, or add full lint/build dependencies immediately.
- **Consequences:** Phase 00 stays verifiable without premature stack implementation, but these scripts are bootstrap-only and must be replaced or expanded in later phases.
---
