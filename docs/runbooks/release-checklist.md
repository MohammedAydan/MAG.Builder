# Release Checklist

This checklist must be completed for every production release of NexPress.

## 1. Pre-Release (Staging/CI)

- [ ] **Build Check:** `pnpm build` passes without errors.
- [ ] **Test Coverage:** `pnpm test` passes all unit and integration tests.
- [ ] **Lint & Types:** `pnpm lint` and `pnpm typecheck` pass.
- [ ] **Security Audit:** `pnpm audit` reviewed for high/critical vulnerabilities.
- [ ] **Database Migrations:** All new migrations are tested against a copy of production data.
- [ ] **OpenAPI Sync:** `api/openapi.json` is updated and validated.
- [ ] **Changelog:** `CHANGELOG.md` is updated with new features and fixes.

## 2. Release Execution

- [ ] **Backup:** Database and media storage backed up.
- [ ] **Migration:** `pnpm migrate` executed and confirmed successful.
- [ ] **Deploy:** Containers/builds updated to the new version.
- [ ] **Readiness:** `/api/readiness` returns 200 on all instances.

## 3. Post-Release Verification (Smoke Tests)

- [ ] **Admin Login:** Can log in to `/admin`.
- [ ] **Content Rendering:** Homepage and key pages render correctly.
- [ ] **Builder Save:** Can open a page in the builder, edit, and save.
- [ ] **Search:** Search results return data.
- [ ] **Commerce (if enabled):** Product details page and cart work.
- [ ] **API Health:** `/api/health` returns 200.
- [ ] **Webhooks:** Webhook delivery system is active.
- [ ] **MCP:** MCP tools (if enabled) are responding to discovery requests.

## 4. Operational Monitoring

- [ ] **Logs:** Monitor logs for new `ERROR` level entries.
- [ ] **Metrics:** Check CPU/Memory usage for abnormalities.
- [ ] **CSP Reports:** Check for unexpected CSP violations in logs.

---

## 5. Rollback Decision Points

Roll back immediately if:
- [ ] `/api/readiness` fails for more than 5 minutes.
- [ ] Critical path (login, homepage, checkout) is broken.
- [ ] Massive spike in error logs or 5xx responses.
- [ ] Data corruption or loss is detected.
