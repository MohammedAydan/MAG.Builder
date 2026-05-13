# Phase 00 Plan

## Goal

Create the initial greenfield monorepo scaffold, planning brain, and status artifacts required to start NexPress safely without implementing later product phases.

## Acceptance Criteria

- Repository root has workspace/config bootstrap files
- `apps/web` and all planned package/module directories exist as placeholders
- `IMPLEMENTATION_STATUS.md` and `plans/` are initialized and aligned to Phase 00
- Root quality-gate scripts run without depending on later-phase implementations
- No CMS, builder, commerce, dashboard, or MCP product behavior is implemented

## Approach

Initialize the planning documents first, then create the monorepo skeleton and placeholder manifests, then add minimal validation scripts that confirm bootstrap integrity, and finally update session/status artifacts after verification.

## Scope

In scope: repository structure, placeholders, root config, status files, and bootstrap validation scripts.

Out of scope: installing Next.js/Payload dependencies, shipping application features, wiring auth, database, CMS, builder, commerce, APIs, or UI.

## Dependencies

- `PLAN.md`
- `01-final-decision-record.md`
- `03-phases/README.md`
- `02-architecture/01-target-architecture.md`
- `02-architecture/02-greenfield-repository-structure.md`

## Estimated Complexity

M
