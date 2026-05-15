# Go / No-Go Checklist

## Release identity

- [ ] Release is labeled `1.0.0-rc.1`, not GA.
- [ ] Stakeholders understand this is a controlled release candidate.

## Verification gates

- [ ] `pnpm install` passed.
- [ ] `pnpm lint` passed.
- [ ] `pnpm typecheck` passed.
- [ ] `pnpm test` passed.
- [ ] `pnpm build` passed.
- [ ] `pnpm --dir apps/web generate:types` passed.
- [ ] `pnpm --dir apps/web migrate:create` output was reviewed and the generated migration file was committed.
- [ ] `pnpm --dir apps/web migrate:status` was reviewed against the target database.
- [ ] `pnpm --dir apps/web migrate` completed on a clean migration-managed database, or the reason it could not safely run is explicitly accepted.

## Route and API sanity

- [ ] `docs/release/SMOKE_TEST_MATRIX.md` has been reviewed for the target environment.
- [ ] Public route checks are complete.
- [ ] Admin/dashboard route checks are complete.
- [ ] API route checks are complete.
- [ ] Auth/membership boundary checks are complete.
- [ ] Multi-site checks are complete.

## Deployment and security

- [ ] `docs/runbooks/deployment.md`, `docs/runbooks/operations.md`, and `docs/runbooks/rollback.md` match the current scripts and env names.
- [ ] `.env.example` still contains placeholders only.
- [ ] Docker and CI configuration do not require real production secrets.
- [ ] The target DB is not only a dev-mode pushed schema unless that risk is explicitly accepted.
- [ ] Known limitations in `docs/release/KNOWN_LIMITATIONS.md` are accepted for the target environment.

## Decision

- [ ] Go for controlled RC deployment
- [ ] No-go until blockers are resolved or explicitly accepted
