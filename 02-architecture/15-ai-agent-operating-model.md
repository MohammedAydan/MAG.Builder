# AI Agent Operating Model

All coding agents must follow the same lifecycle.

## Lifecycle

1. Read the tool-specific instruction file.
2. Read `PLAN.md` and current phase docs.
3. Produce a short implementation plan.
4. Modify only files needed for the phase.
5. Run quality gates.
6. Update `IMPLEMENTATION_STATUS.md`.
7. Stop for review.

## Anti-patterns

- building multiple phases at once;
- rewriting architecture without recording an ADR;
- ignoring tests;
- hiding failing commands;
- using outdated Next.js or Payload patterns without checking current docs;
- introducing runtime plugin execution.
