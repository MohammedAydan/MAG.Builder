# Parallel Agent Rules

## Default rule

Do not run multiple agents on adjacent phases on the same branch.

## Safe parallelism allowed only after Phase 28 is complete

You may run two agents only if:
- each agent has a separate branch,
- scopes do not overlap,
- shared files are reserved for one integration branch,
- a human reviews the merge.

## Files that often conflict

Avoid editing these from multiple branches:
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `pnpm-lock.yaml`
- `.env.example`
- `apps/web/src/payload.config.ts`
- `apps/web/src/payload-types.ts`
- `packages/api/src/openapi.ts`
- `apps/web/src/lib/auth/access.ts`
- `apps/web/src/lib/dashboard/navigation.ts`
- `apps/web/package.json`
- root `package.json`

## Good split after Phase 28

Agent A:
- Phase 29 runtime services.

Agent B:
- Phase 30 admin UX.

Do not run Commerce Production Checkout in parallel with Runtime Services if email/queue/payment adapter decisions are not merged yet.

## Merge protocol

1. Agent branch finishes.
2. Run checks on branch.
3. Merge into integration branch.
4. Resolve conflicts manually.
5. Run:
   - `pnpm install`
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
6. Only one final commit updates global tracking files.
