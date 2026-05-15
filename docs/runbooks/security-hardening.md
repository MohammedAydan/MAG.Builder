# Security & Observability Hardening Runbook

This document describes the security and observability hardening applied to MAG Builder / NexPress, providing a baseline for production readiness.

## 1. Threat Model & Security Baseline

MAG Builder operates with a multi-tenant, SaaS-ready architecture combining a public storefront, a visual builder, and a headless CMS. The threat model accounts for the following actors:
- **Public Members**: Access storefronts and authenticated member-only routes.
- **Storefront Guests**: Unauthenticated access to public content.
- **Editors/Admins**: Access the Payload CMS dashboard and visual editor.
- **Super-Admins**: Global configuration and marketplace management.

### Key Trust Boundaries
- **Server/Client Boundary**: Next.js Server Components and Route Handlers isolate database access, API keys, and sensitive payload secrets from the client.
- **Tenant Isolation**: Multi-site features enforce `siteId` scoping on content, forms, commerce, and search to prevent cross-tenant data leakage.
- **Marketplace Isolation**: The plugin marketplace strictly enforces a "dry-run" or verified deployment process to prevent RCE via untrusted packages.

## 2. Hardening Measures Implemented

- **Content Security Policy (CSP)**: A staged baseline CSP is configured via Next.js `next.config.ts`. It allows Payload CMS and Next.js internal features while restricting external embeds.
- **Security Headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security`, and `Permissions-Policy` are enforced globally via Next.js headers.
- **Runtime Environment Validation**: `apps/web/src/lib/env.ts` splits build-time and run-time validation. Runtime secrets (`PAYLOAD_SECRET`, `DATABASE_URL`) are loaded lazily so they are never leaked into the static build process or the client bundle.
- **Data Redaction**: Sensitive fields (e.g., passwords, API keys, Medusa tokens) are automatically redacted using `@nexpress/observability` before being logged.
- **Error Serialization**: Internal server errors are caught and transformed into generic safe client errors to prevent stack trace or configuration leakage.
- **Correlation IDs**: `AsyncLocalStorage` tracks request IDs across asynchronous operations to trace requests reliably without coupling logic.
- **Readiness Probes**: `/api/readiness` exposes safe booleans for database configuration and payload initialization status without leaking credentials or raw provider errors.

## 3. OWASP ASVS 5.0.0 Mapping Checklist

The following controls align with the OWASP Application Security Verification Standard (ASVS) where practical for a Next.js / Payload application:

- [x] **V1: Architecture** - Secure defaults, bounded contexts (Marketplace, Commerce), server-side enforcement.
- [x] **V2: Authentication** - Payload CMS enforces robust password hashing and session management. Public members are partitioned from admin users.
- [x] **V3: Session Management** - HttpOnly, Secure cookies managed by Payload.
- [x] **V4: Access Control** - RBAC matrix strictly limits roles (`super-admin`, `admin`, `editor`). Public members cannot assume admin roles.
- [x] **V5: Validation & Sanitization** - Zod schemas validate API contracts, Webhook payloads, and environment variables.
- [x] **V7: Error Handling & Logging** - Redaction applied to logs. Safe client errors enabled globally.
- [x] **V8: Data Protection** - Secrets are decoupled from build steps. No secrets stored in logs or analytics databases.
- [x] **V14: Configuration** - CSP and Strict-Transport-Security headers enabled. In-memory rate limits deployed as baseline.

## 4. Production Readiness Checklist

Before moving to Phase 26 (Deployment Automation), verify the following manually or via CI:

- [ ] Rate Limiters: Ensure a Redis or robust adapter replaces in-memory limiters for multi-instance deployments.
- [ ] Dependency Scanning: Run `pnpm audit` in CI to catch vulnerable packages.
- [ ] Database Transactions: Ensure complex operations (like `install`) utilize database transactions.
- [ ] CSP Rollout: Move CSP from staged/baseline to strict using nonces for dynamic Next.js routes if required by compliance.

## 5. Ongoing Monitoring

- Watch `error` level logs from `@nexpress/observability`.
- Use the correlation ID provided in logs to trace multi-step operations (e.g. visual builder save -> audit log -> analytics trigger).
- Monitor `/api/readiness` during deployments to verify container health.
