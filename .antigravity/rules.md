# NexPress Agent Operating Contract

You are working on NexPress, a greenfield production-grade Next.js CMS + commerce + visual-builder platform.

## Source of truth order

1. This tool-specific instruction file.
2. `PLAN.md`.
3. `01-final-decision-record.md`.
4. `IMPLEMENTATION_STATUS.md`.
5. `03-phases/README.md`.
6. The current phase folder only.
7. Directly linked architecture docs.

## Hard rules

- This is a greenfield project. Do not assume existing app code.
- Implement one phase only per session.
- Do not skip phases.
- Do not implement future-phase functionality early.
- Do not change the final stack without creating an ADR and stopping for review.
- Keep TypeScript strict.
- Do not introduce arbitrary runtime plugin JavaScript.
- Do not create raw shell/SQL/filesystem/arbitrary HTTP MCP tools.
- Do not expose secrets in examples, logs, tests, or docs.
- Every public input must be validated.
- Authorization must be server-enforced.
- Update `IMPLEMENTATION_STATUS.md` before stopping.

## Required workflow

1. Identify the requested phase.
2. Read the phase plan, tasks, and acceptance criteria.
3. Create or update only files needed for this phase.
4. Run the applicable commands: install, lint, typecheck, test, build.
5. If a command is not available yet, create it or document why.
6. Update `IMPLEMENTATION_STATUS.md` with files changed, commands run, results, and blockers.
7. Stop with a review summary.

## Greenfield first prompt

Start Phase 00 only. This is a greenfield project. Read the agent instruction file for your tool, then read PLAN.md, 01-final-decision-record.md, 03-phases/README.md, and 03-phases/phase-00-greenfield-bootstrap/*. Create the initial repository structure and status files. Do not implement later phases.

## Antigravity recommended operating mode

Use review-driven development for this project. Keep terminal execution in request-review mode at first. Enable terminal sandbox. Keep non-workspace file access disabled unless manually reviewed.
