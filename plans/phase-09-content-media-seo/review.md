# Review - Phase 09: Content, Media, and SEO

## Summary

Phase 09 introduces the first CMS content layer for NexPress. The implementation adds
Payload collections for pages, posts, media, and redirects; reusable SEO, slug, and
publishing helpers; published-only public content queries; and minimal public routes
that prove page/post rendering, redirect fallback, and sitemap/robots generation
without introducing the visual builder or theme/template systems.

## Files changed

- `apps/web/src/collections/Media.ts`
- `apps/web/src/collections/Pages.ts`
- `apps/web/src/collections/Posts.ts`
- `apps/web/src/collections/Redirects.ts`
- `apps/web/src/payload.config.ts`
- `apps/web/src/payload-types.ts`
- `apps/web/src/lib/auth/access.ts`
- `apps/web/src/lib/auth/permissions.ts`
- `apps/web/src/lib/audit/service.ts`
- `apps/web/src/lib/content/access.test.ts`
- `apps/web/src/lib/content/audit.ts`
- `apps/web/src/lib/content/hooks.ts`
- `apps/web/src/lib/content/paths.ts`
- `apps/web/src/lib/content/public.test.ts`
- `apps/web/src/lib/content/public.ts`
- `apps/web/src/lib/content/publishing.ts`
- `apps/web/src/lib/content/seo.ts`
- `apps/web/src/lib/content/slug.ts`
- `apps/web/src/app/(public)/page.tsx`
- `apps/web/src/app/(public)/[slug]/page.tsx`
- `apps/web/src/app/(public)/journal/[slug]/page.tsx`
- `apps/web/src/app/robots.txt/route.ts`
- `apps/web/src/app/sitemap.xml/route.ts`
- `apps/web/src/components/public/public-shell-frame.tsx`
- `IMPLEMENTATION_STATUS.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`

## Commands run

- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/web generate:types`
- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Tests added

- `apps/web/src/lib/content/access.test.ts`
- `apps/web/src/lib/content/public.test.ts`

## Security considerations

- Pages and posts use Payload drafts with public reads restricted to `_status = published`.
- Public server-side content queries explicitly use `overrideAccess: false` to respect collection access control.
- Redirect resolution only uses active redirect records and stays server-side.
- Media writes are restricted to authenticated content roles; public reads are intentional for public-safe assets only.
- No public route exposes drafts, admin data, users, audit logs, installation-state, or runtime secrets.

## Payload types and migration status

- Payload types were regenerated into `apps/web/src/payload-types.ts`.
- No migration file was generated or committed in this phase because Payload migration generation still requires a live database.

## Known gaps

- Public media is intentionally open for safe image assets; private/protected media workflows remain out of scope.
- Public route coverage remains helper-level and build-level rather than full integration/e2e coverage.
- Existing earlier gaps remain unchanged, including fail-open audit writes, non-transactional install bootstrap writes, and no live DB integration coverage.

## Recommendation

- [x] Approve
- [ ] Request changes
