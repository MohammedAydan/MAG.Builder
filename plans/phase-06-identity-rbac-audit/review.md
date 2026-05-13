# Review - Phase 06: Identity, RBAC, and Audit

## Summary

Phase 06 adds typed roles, centralized permission helpers, Payload-backed access rules,
and server-only audit logging for the current system-critical actions. Payload Auth
remains the authentication layer, while NexPress now defines explicit authorization
behavior for admin, system, user, and audit resources.

## Files changed

- `apps/web/src/lib/auth/roles.ts`
- `apps/web/src/lib/auth/permissions.ts`
- `apps/web/src/lib/auth/access.ts`
- `apps/web/src/lib/auth/access.test.ts`
- `apps/web/src/lib/audit/service.ts`
- `apps/web/src/lib/audit/service.test.ts`
- `apps/web/src/collections/AuditLogs.ts`
- `apps/web/src/collections/Users.ts`
- `apps/web/src/collections/InstallationState.ts`
- `apps/web/src/lib/install/service.ts`
- `apps/web/src/scripts/seed.ts`
- `apps/web/src/payload.config.ts`
- `docs/runbooks/identity-rbac-audit.md`
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`

## Commands run

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web test`

## Tests added/updated

- `src/lib/auth/access.test.ts`
- `src/lib/audit/service.test.ts`
- `src/lib/install/service.test.ts`

## Security considerations

- Roles are typed and centralized; stringly-typed scattered role checks were avoided.
- `access.admin` now protects admin access on the auth collection.
- Non-admin users are not treated as admin users.
- The `role` field is restricted to `super-admin`.
- Audit metadata is sanitized before persistence.
- Audit logs, install state, and users remain non-public.
- Install protections from Phase 05 remain intact.

## Known gaps

- Audit logging is currently fail-open; write failures do not block the original action.
- The Phase 05 install flow still has the previously documented non-transactional write gap.
- No live-database integration test was added for auth/audit behavior.
- No migration file was generated because Payload migration generation still requires a live database connection.

## Recommendation

- [x] Approve
- [ ] Request changes
