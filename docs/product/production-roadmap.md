# Production Roadmap & Known Gaps

This document tracks known blockers and deferred hardening work that should be addressed after the initial production release.

## 1. High Priority Gaps

- **CSP Strict Nonces:** Currently using a staged CSP without strict nonces. Moving to strict nonces is required for full protection but requires deep integration with Payload CMS and the visual builder's inline styles.
- **Rate Limiting Adapter:** Currently using in-memory rate limiting. A Redis-backed adapter is required for multi-instance production environments to prevent bypass.
- **Audit Transactionality:** Audit logs are currently "fail-open" and not part of the database transaction. A failure in the audit log write does not rollback the main operation.
- **External Package Verification:** The marketplace system handles dry-run planning but lacks external signature verification and key distribution.

## 2. Infrastructure & Operations

- **Full CI/CD Pipelines:** Automated deployment (CD) to staging/production is not yet implemented.
- **Auto-Scaling Policy:** Formal auto-scaling triggers based on CPU/Memory/Request rate are not defined.
- **Database High Availability:** While supported by PostgreSQL, the specific cluster configuration (Primary/Replica) is environment-dependent.

## 3. Product & Feature Gaps (Deferred)

- **Real Payments:** Checkout is limited to test mode. Stripe/PayPal/Mollie integrations are deferred.
- **Shipping & Tax Calculation:** Dynamic shipping rates and automated tax (Avalara/TaxJar) are deferred.
- **Multi-site Isolation Hardening:** While site-aware filtering exists, some edge cases in shared media or cross-site references may require further validation.
- **Advanced Content Workflows:** Approval chains, scheduled publishing, and advanced revision history are deferred.

## 4. Maintenance & Security

- **Automated Dependency Updates:** Dependabot or Renovate should be configured.
- **Pentest/Security Review:** A formal external security audit has not been conducted.
- **Secret Rotation Automation:** Rotation of secrets (S3 keys, DB passwords) is currently manual.
