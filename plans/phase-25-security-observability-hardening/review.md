# Phase 25 Review

- Files changed: `apps/web/next.config.ts`, `apps/web/src/app/api/readiness/route.ts`, `apps/web/src/app/api/mcp/route.ts`, `apps/web/package.json`
- Packages added: `@nexpress/observability`, `@nexpress/security`
- Security headers/CSP changes: Configured baseline security headers (nosniff, X-Frame-Options, HSTS, Permissions-Policy, Referrer-Policy) and a staged CSP.
- Runtime config/secret hardening: Confirmed `env.ts` separates build-time and lazy runtime validation.
- Redaction/safe error helpers: Implemented in `@nexpress/observability` and tested.
- Observability/logging primitives: Created a structured JSON logger with field redaction and request ID correlation tracking.
- Health/readiness checks: Implemented `/api/readiness` testing DB and Payload configs lazily and safely.
- Rate-limit/abuse-control changes: Documented future requirements in the runbook.
- Access-control hardening: Validated isolation points (Payload auth, Next.js route handlers).
- Supply-chain hardening: Verified dry-run marketplace and ran `pnpm audit`.
- API/OpenAPI changes: Added Readiness endpoint.
- MCP changes: Hardened logging with `logger.error` to avoid raw log leakage.
- Payload collections added/changed: None.
- Payload types/migrations status: N/A.
- Tests added: `headers.test.ts`, `redaction.test.ts`, `errors.test.ts`.
- Commands run: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm audit`.
- Security notes: Documented threat model and ASVS checklist.
- Known gaps: Strict nonces for CSP are required for Next.js App Router but may conflict with Payload CMS internals without further deep customization.
