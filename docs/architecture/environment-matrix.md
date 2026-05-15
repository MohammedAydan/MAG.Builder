# Production Environment Variable Matrix

This document defines the environment variables required for production deployment of NexPress.

## 1. Core Platform (Required)

| Variable | Type | Description |
|---|---|---|
| `DATABASE_URI` | Secret | PostgreSQL connection string. |
| `PAYLOAD_SECRET` | Secret | Long random string for JWT and encryption. |
| `NEXT_PUBLIC_SITE_URL` | String | Canonical public URL (e.g., `https://example.com`). |

## 2. Server Performance & Networking (Recommended)

| Variable | Type | Default | Description |
|---|---|---|---|
| `NODE_ENV` | String | `production` | Set to `production` for optimized runtime. |
| `PORT` | Number | `3000` | Port the server listens on. |
| `HOSTNAME` | String | `0.0.0.0` | Binding address. |
| `NEXT_TELEMETRY_DISABLED` | Boolean | `1` | Disables Next.js anonymous usage collection. |
| `TRUST_PROXY` | Boolean | `false` | Set to `true` if behind a reverse proxy (required for multi-site host resolution). |

## 3. Storage & Media (Production)

| Variable | Type | Description |
|---|---|---|
| `S3_ENDPOINT` | String | Endpoint for S3-compatible storage. |
| `S3_ACCESS_KEY_ID` | Secret | S3 access key. |
| `S3_SECRET_ACCESS_KEY` | Secret | S3 secret key. |
| `S3_BUCKET` | String | Target bucket name. |
| `S3_REGION` | String | S3 region. |

## 4. Commerce Integration (Optional)

| Variable | Type | Description |
|---|---|---|
| `MEDUSA_BACKEND_URL` | String | URL of the Medusa backend. |
| `MEDUSA_PUBLISHABLE_KEY` | String | Medusa public key. |
| `MEDUSA_ADMIN_API_TOKEN` | Secret | Medusa admin API token. |

## 5. Security & CSP

| Variable | Type | Description |
|---|---|---|
| `CSP_REPORT_ONLY` | Boolean | If `true`, CSP violations are logged but not blocked. |
| `SECURE_COOKIES` | Boolean | Forces `Secure` flag on all application cookies. |

## 6. Observability

| Variable | Type | Description |
|---|---|---|
| `LOG_LEVEL` | String | `info`, `warn`, `error`, `debug`. |
| `LOG_REDACTION_ENABLED` | Boolean | `true` by default. |

---

### Validation Rules

NexPress uses `apps/web/src/lib/env.ts` to validate these variables.
- **Build-time:** Only `buildEnv` variables are validated (e.g., `NEXT_PUBLIC_*`).
- **Runtime:** `getRuntimeEnv()` validates all secrets lazily to prevent build-time failures in CI/CD when secrets are missing.
