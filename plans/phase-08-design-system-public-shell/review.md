# Review - Phase 08: Design System and Public Shell

## Summary

Phase 08 introduces the first project-owned public-facing shell for NexPress. The implementation
adds centralized semantic tokens, CSS-variable theming scoped to a dedicated public route group,
and a minimal reusable component layer for the homepage without importing dashboard or Payload
admin-only code into the public surface.

## Files changed

- `.impeccable.md`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/(public)/layout.tsx`
- `apps/web/src/app/(public)/page.tsx`
- `apps/web/src/lib/design-system/tokens.ts`
- `apps/web/src/lib/design-system/tokens.test.ts`
- `apps/web/src/lib/public-shell/navigation.ts`
- `apps/web/src/lib/public-shell/content.ts`
- `apps/web/src/lib/public-shell/content.test.ts`
- `apps/web/src/components/public/public-shell-frame.tsx`
- `apps/web/src/components/public/section-heading.tsx`
- `apps/web/src/components/public/surface-card.tsx`
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`

## Commands run

- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web build`
- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Tests added

- `apps/web/src/lib/design-system/tokens.test.ts`
- `apps/web/src/lib/public-shell/content.test.ts`

## Security considerations

- The public shell is isolated under its own route group and does not import dashboard or Payload
  admin helper modules.
- The homepage remains server-first and only checks installation state before rendering or
  redirecting to `/install`.
- No private collections, user data, runtime secrets, or raw configuration values are rendered
  into the public UI.
- Existing install, RBAC, and audit behavior from earlier phases remains unchanged.

## Known gaps

- No interactive theme switcher is added yet; Phase 08 only introduces light-first, dark-ready
  tokens.
- Public shell coverage is through pure token/content tests rather than integration or e2e tests.
- Existing Phase 05-07 gaps remain unchanged, including fail-open audit writes, non-transactional
  install bootstrap writes, and no live DB integration coverage.

## Recommendation

- [x] Approve
- [ ] Request changes
