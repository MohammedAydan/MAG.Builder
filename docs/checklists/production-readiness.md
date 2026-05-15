# Production Readiness Checklist

This checklist must be reviewed before the initial production launch of NexPress.

## 1. Infrastructure & Deployment

- [ ] **Dockerized:** Application can be built and run via Docker.
- [ ] **Monitoring:** `/api/health` and `/api/readiness` are wired to an external monitoring service.
- [ ] **Logging:** Logs are being aggregated in a centralized system.
- [ ] **Database:** PostgreSQL is configured with automated backups and high availability (if required).
- [ ] **Storage:** S3-compatible storage is configured for media uploads.
- [ ] **Environment Variables:** All variables in `docs/architecture/environment-matrix.md` are correctly set in the production environment.

## 2. Security

- [ ] **Secrets:** No secrets are committed to version control.
- [ ] **Auth:** Password complexity and account lockout policies are reviewed.
- [ ] **CSP:** Content Security Policy is active (even if in `report-only` mode).
- [ ] **Headers:** All baseline security headers are active.
- [ ] **HTTPS:** Strict-Transport-Security (HSTS) is enabled.
- [ ] **Audit:** Audit logging is confirmed working and capturing critical actions (logins, config changes).
- [ ] **Rate Limiting:** Global rate limiting is configured at the reverse proxy or application layer.

## 3. Operations

- [ ] **Runbooks:** Deployment, Operations, and Rollback runbooks are complete and verified.
- [ ] **Backup/Restore:** A full backup and restore cycle has been successfully tested.
- [ ] **Scaling:** Application and Database scaling limits are understood.
- [ ] **Incident Response:** Team knows who to contact and where to find logs during an outage.

## 4. Quality & Compliance

- [ ] **Performance:** Page Load Time (LCP) is under 2.5s for the homepage.
- [ ] **Accessibility:** No critical A11y violations found in automated scans.
- [ ] **Privacy:** GDPR/CCPA compliance reviewed (cookie banners, data deletion requests).
- [ ] **OpenAPI:** Public API documentation is accurate and published.

## 5. Platform Specifics

- [ ] **Payload CMS:** Migrations are current and verified.
- [ ] **Commerce:** Checkout flow (test mode) works in the production environment.
- [ ] **Builder:** Global sections and reusable components are correctly published.
- [ ] **Plugins:** Only approved and verified plugins are active.
