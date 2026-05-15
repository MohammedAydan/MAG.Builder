# NexPress Completion Prompts v2

This folder is a revised, file-map-aware prompt pack for continuing MAG Builder / NexPress after the Release Candidate work.

Use these prompts **one by one**. Do not run multiple agents against adjacent phases on the same branch.

## Why this v2 exists

The new project map shows a real but still foundation-heavy system:
- 273 scanned files and 28,373 total lines.
- Many packages exist, but several areas remain MVP/stub/dry-run.
- The tree already contains `nexpress_completion_prompts/`, but this v2 reorganizes the remaining work by practical product completion, not just by earlier phase numbers.

## Recommended order

1. `01-phase-28-rc-fix-pack-live-db-validation-v2.md`
2. `02-phase-29-production-runtime-services-v2.md`
3. `03-phase-30-admin-control-center-v2.md`
4. `04-phase-31-builder-forms-media-v2.md`
5. `05-phase-32-commerce-production-checkout-v2.md`
6. `06-phase-33-saas-control-plane-v2.md`
7. `07-phase-34-marketplace-plugin-template-ui-v2.md`
8. `08-phase-35-search-analytics-automation-production-v2.md`
9. `09-phase-36-security-hardening-e2e-v2.md`
10. `10-phase-37-ga-release-stabilization-v2.md`

Supporting files:
- `00-master-gap-map-and-todo.md`: consolidated file-by-file gap map.
- `11-parallel-agent-rules.md`: when parallel agents are allowed and how to avoid merge conflicts.
- `12-final-ga-definition.md`: what “complete” means before calling this production-ready.

## Mandatory workflow for every prompt

```bash
git status --short
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If the prompt touches Payload collections:

```bash
pnpm --dir apps/web generate:types
```

If the prompt touches Docker/deployment:

```bash
docker compose config
docker build -t nexpress-check .
```

If Docker is unavailable, document that as a verification gap, not a success.

## Commit style

After every prompt completes and all required checks pass:

```bash
git add .
git commit -m "feat: complete phase XX <name>"
```

Use `fix:` instead of `feat:` for the RC fix pack if it only fixes release blockers.
