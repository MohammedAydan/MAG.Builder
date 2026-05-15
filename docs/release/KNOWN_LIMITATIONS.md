# Known Limitations and Blockers

## Release-candidate blockers before broader GA

- A committed live-database migration now exists (`apps/web/src/migrations/20260515_181413.ts`), but applying it cleanly still requires a migration-managed PostgreSQL target. The current local validation DB was previously pushed in dev mode, so `payload migrate` collides with already-existing schema objects.
- Payload 3.84.1 generated the migration file with runtime imports for type-only symbols in this environment; the file had to be corrected to `import type` before `migrate:status` could load it.
- CSP is still staged rather than strict nonce-based.
- Rate limiting remains in-memory and is not suitable for horizontally scaled production by itself.
- Audit logging is fail-open and non-transactional.
- Backup and restore guidance exists, but each deployment environment still needs a recorded restore rehearsal.
- Docker validation remains environment-dependent; this Phase 28 session could not run `docker build` or `docker compose` because Docker is not installed on the machine.

## Intentional release-candidate boundaries

- Commerce remains test-mode only; no real payment capture is implemented.
- Shipping, taxes, coupons, inventory sync, refunds, and guest carts remain out of scope.
- Marketplace actions remain admin-only and dry-run only; no package-manager execution, remote fetch, or runtime code loading exists.
- MCP remains authenticated, scoped, and read-oriented without raw shell, filesystem, SQL, or arbitrary HTTP tools.
- Multi-site support is readiness-oriented and does not provide a SaaS control plane, tenant billing, or white-label management.

## Documentation and assurance limits

- OpenAPI documents the current JSON API subset and intentionally excludes browser form-post auth flows and Payload internal routes.
- Smoke coverage in this phase is primarily documented rather than full browser E2E automation.
- Performance and accessibility sign-off still require deployment-environment evidence.
