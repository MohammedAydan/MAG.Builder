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
- [ ] Known limitations in `docs/release/KNOWN_LIMITATIONS.md` are accepted for the target environment.

## Decision

- [ ] Go for controlled RC deployment
- [ ] No-go until blockers are resolved or explicitly accepted
