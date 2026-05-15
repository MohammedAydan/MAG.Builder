# Changelog

## 1.0.0-rc.1 - 2026-05-15

### Release focus

- Finalized the first stable release-candidate documentation package.
- Added final route, API, auth, admin, and multi-site smoke matrices.
- Corrected deployment, rollback, CI, and environment-reference drift discovered during the release-candidate review.
- Tightened the published OpenAPI contract so it reflects the current JSON API surface more accurately.

### Platform scope included in the release candidate

- Next.js 16 App Router application with Payload CMS integration
- CMS content, SEO, media, and public rendering foundations
- Builder kernel and visual editor adapter
- Themes/templates and local plugin/module registries
- Forms, membership protection, commerce test-mode boundaries, APIs, webhooks, MCP gateway safety boundaries, multi-site readiness, marketplace dry-run planning, observability, and deployment foundations

### Important non-GA limitations

- This is a release candidate, not a final GA claim.
- Real payments, shipping, taxes, coupons, and inventory sync remain out of scope.
- Marketplace execution and remote package installation remain disabled.
- MCP remains limited to safe bounded server-side tools.
- Several operational hardening items are still tracked in `docs/release/KNOWN_LIMITATIONS.md`.
