# Implementation Phases

Agents must implement phases in order. Do not skip phases. Do not implement more than one phase in a single session unless a human explicitly asks and updates the status file.

## Phase status values

- not-started
- in-progress
- blocked
- review
- done

## Per-phase required workflow

1. Read the phase folder.
2. Read linked architecture docs.
3. Update `IMPLEMENTATION_STATUS.md` to mark the phase in-progress.
4. Implement only this phase.
5. Run quality gates.
6. Update the phase section in `IMPLEMENTATION_STATUS.md` with changes, tests, failures, and next steps.
7. Stop.

## Quality gates by default

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If a command does not exist yet in early phases, create the script or document why it is not available yet.
