# Phase 15 Review - Membership and Protected Routes

## Summary

Phase 15 added a separate public `members` auth collection, server-side member auth routes, a protected `/account` route, and members-only page/post visibility controls while preserving the existing admin/dashboard `users` boundary.

## Files changed

- `apps/web/src/collections/{Members,Pages,Posts}.ts`
- `apps/web/src/lib/auth/access.{ts,test.ts}`
- `apps/web/src/lib/audit/service.ts`
- `apps/web/src/lib/content/{access-fields.ts,public.ts,public.test.ts}`
- `apps/web/src/lib/members/{service.ts,service.test.ts}`
- `apps/web/src/app/(public)/{login,signup,account}/page.tsx`
- `apps/web/src/app/api/members/**/*`
- `apps/web/src/lib/public-shell/{navigation.ts,content.test.ts}`
- `apps/web/src/payload.config.ts`
- `apps/web/src/payload-types.ts`
- `docs/runbooks/membership-protected-routes.md`
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`

## Commands run

- `pnpm.cmd install`
- `pnpm.cmd lint`
- `pnpm.cmd typecheck`
- `pnpm.cmd test`
- `pnpm.cmd build`
- `pnpm.cmd --dir packages/forms lint`
- `pnpm.cmd --dir packages/forms typecheck`
- `pnpm.cmd --dir packages/forms test`
- `pnpm.cmd --dir packages/forms build`
- `pnpm.cmd --dir packages/plugins lint`
- `pnpm.cmd --dir packages/plugins typecheck`
- `pnpm.cmd --dir packages/plugins test`
- `pnpm.cmd --dir packages/plugins build`
- `pnpm.cmd --dir packages/builder-core lint`
- `pnpm.cmd --dir packages/builder-core typecheck`
- `pnpm.cmd --dir packages/builder-core test`
- `pnpm.cmd --dir packages/builder-core build`
- `pnpm.cmd --dir packages/builder-editor lint`
- `pnpm.cmd --dir packages/builder-editor typecheck`
- `pnpm.cmd --dir packages/builder-editor test`
- `pnpm.cmd --dir packages/builder-editor build`
- `pnpm.cmd --dir packages/themes lint`
- `pnpm.cmd --dir packages/themes typecheck`
- `pnpm.cmd --dir packages/themes test`
- `pnpm.cmd --dir packages/themes build`
- `pnpm.cmd --dir apps/web generate:types`
- `pnpm.cmd --dir apps/web lint`
- `pnpm.cmd --dir apps/web typecheck`
- `pnpm.cmd --dir apps/web test`
- `pnpm.cmd --dir apps/web build`

## Tests added/updated

- member auth validation and redirect safety tests
- admin/member separation and member-aware content-access tests
- protected published content resolution tests
- public shell navigation test updated for the new member login entry

## Security considerations

- public members use a dedicated `members` collection and never receive admin roles
- member sessions use a separate HTTP-only cookie and do not reuse the dashboard/admin session
- member sign-up is server-only and collection-level public create remains denied
- anonymous public content reads now exclude members-only content by default
- members-only content is removed from sitemap generation

## Known gaps

- no password reset or email verification flow yet
- no live DB migration file for the new collection/fields because migration generation still requires a live database
- member management UI inside the dashboard is still out of scope

## Recommendation

- [x] Approve
- [ ] Request changes
