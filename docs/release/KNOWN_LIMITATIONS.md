# Known Limitations and Blockers

## Release-candidate blockers before broader GA

- No committed live database migration files exist for several recent Payload collection changes because generation still requires a live database.
- CSP is still staged rather than strict nonce-based.
- Rate limiting remains in-memory and is not suitable for horizontally scaled production by itself.
- Audit logging is fail-open and non-transactional.
- Backup and restore guidance exists, but each deployment environment still needs a recorded restore rehearsal.

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
