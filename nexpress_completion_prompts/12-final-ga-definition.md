# Final GA Definition

Do not call NexPress production GA until all items below are true.

## Required technical gates

- Docker build verified.
- Docker compose config verified.
- Live PostgreSQL migration generation verified.
- Live PostgreSQL migration execution verified.
- Install wizard verified from clean DB.
- Backup and restore tested.
- `pnpm install` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed.
- `pnpm build` passed.
- E2E smoke tests passed or a signed No-Go exception exists.

## Required product gates

- Admin can manage pages.
- Admin can use builder.
- Admin can manage forms and view submissions.
- Admin can manage sites/domains or at least default site.
- Admin can view marketplace/plugin/template/theme status.
- Public member signup/login/account works.
- Public content and members-only content boundaries work.
- Forms render and submit from public pages.
- Commerce product/cart/checkout behavior is clear and safe.
- Search works on published content.
- Analytics summary works.
- Automation triggers are safe and documented.

## Explicitly accepted limitations can remain if documented

Examples:
- Marketplace dry-run only.
- MCP read-only only.
- Payment provider disabled or test-mode only.
- No guest carts.
- No strict nonce CSP yet.
- No production telemetry provider yet.

## Hard No-Go

- Open redirect.
- Cross-site/tenant leak.
- Draft content public leak.
- Public role escalation.
- Secrets in docs or examples.
- Raw database/MCP/shell/file tools.
- Docker cannot build and no exception.
- Migrations missing with no live DB verification.
