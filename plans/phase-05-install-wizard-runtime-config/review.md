# Review - Phase 05: Install Wizard and Runtime Config

## Summary

Phase 05 adds the first-run installation foundation for NexPress. The web app can now
determine installation state on the server, route fresh deployments into `/install`,
validate install input safely, create the initial admin account, and block reinstall attempts.

The runtime env split introduced earlier remains intact: `DATABASE_URL` and
`PAYLOAD_SECRET` are still validated only inside runtime code paths, not during static build.

## Files changed

- `apps/web/src/collections/InstallationState.ts`
- `apps/web/src/lib/payload.ts`
- `apps/web/src/lib/install/runtime-config.ts`
- `apps/web/src/lib/install/service.ts`
- `apps/web/src/lib/install/security.ts`
- `apps/web/src/app/install/page.tsx`
- `apps/web/src/app/api/install/route.ts`
- `apps/web/src/app/api/install/route.test.ts`
- `apps/web/src/lib/install/runtime-config.test.ts`
- `apps/web/src/lib/install/security.test.ts`
- `apps/web/src/lib/install/service.test.ts`
- `apps/web/src/payload.config.ts`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/vitest.config.ts`
- `.env.example`
- `docs/runbooks/installation.md`
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

- `src/lib/install/runtime-config.test.ts`
- `src/lib/install/security.test.ts`
- `src/lib/install/service.test.ts`
- `src/app/api/install/route.test.ts`

## Security considerations

- Install status is checked server-side only.
- The install POST route performs same-origin validation.
- The install form enforces strong password rules server-side.
- Reinstall attempts are blocked when an installation record or existing admin user is present.
- No secrets are exposed to client components.
- Payload Local API uses `overrideAccess: true` only for the initial bootstrap writes, and this behavior is documented.

## Known gaps

- The install flow performs two sequential writes without a database transaction, so a partial failure could leave a created user without an installation-state record. The wizard still blocks re-entry because existing users are treated as installed, but a future hardening phase should make this transactional.
- No live database integration test exists yet for the install route. Current coverage is unit and route-smoke level only.
- No migration file was generated for the new collection because migration generation still requires a live database connection.

## Recommendation

- [x] Approve
- [ ] Request changes
