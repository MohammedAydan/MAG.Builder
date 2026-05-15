# Production Environment Variable Matrix

This matrix reflects the variables currently consumed by the repository as of the Phase 27 release candidate. It intentionally excludes future-facing placeholders that are not read by the code today.

## 1. Core Runtime

| Variable | Required | Type | Source | Notes |
|---|---|---|---|---|
| `NODE_ENV` | Yes | String | `apps/web/src/lib/env.ts` | Must be `development`, `test`, or `production`. |
| `PAYLOAD_SECRET` | Yes | Secret | `apps/web/src/lib/env.ts` | Runtime-only validation; never commit a real value. |
| `DATABASE_URL` | Yes | Secret | `apps/web/src/lib/env.ts`, `apps/web/src/payload.config.ts` | PostgreSQL connection string used by Payload and readiness checks. |

## 2. Install and Multi-site

| Variable | Required | Default | Source | Notes |
|---|---|---|---|---|
| `NEXPRESS_INSTALLATION_MODE` | No | `wizard` | install/runtime services | Keeps the first-run install flow enabled or controlled by deployment policy. |
| `NEXPRESS_DEFAULT_SITE_NAME` | No | `NexPress Local` | site bootstrap helpers | Used when creating the default site record. |
| `NEXPRESS_TRUST_PROXY_HOST` | No | `false` | `apps/web/src/lib/sites/service.ts` | Set to `true` only behind a trusted reverse proxy. |

## 3. Commerce Runtime

| Variable | Required | Default | Source | Notes |
|---|---|---|---|---|
| `NEXPRESS_COMMERCE_PROVIDER` | No | `disabled` | `packages/commerce/src/config.ts` | Supported values: `disabled`, `medusa`. |
| `MEDUSA_BACKEND_URL` | If `medusa` | None | `packages/commerce/src/config.ts` | Must be an absolute `http` or `https` URL; non-local production usage must be `https`. |
| `MEDUSA_DEFAULT_REGION_ID` | If `medusa` | None | `packages/commerce/src/config.ts` | Required for cart and checkout flows. |
| `MEDUSA_HEALTH_PATH` | No | `/health` | `packages/commerce/src/config.ts` | Must begin with `/`. |
| `MEDUSA_PUBLISHABLE_KEY` | If `medusa` | None | `packages/commerce/src/config.ts` | Public Medusa storefront key. |
| `MEDUSA_REQUEST_TIMEOUT_MS` | No | `5000` | `packages/commerce/src/config.ts` | Positive integer capped at `30000`. |
| `MEDUSA_SERVER_TOKEN` | Optional | None | `packages/commerce/src/config.ts` | Required for some server-side customer and admin commerce operations. |

## 4. Operations and Logging

| Variable | Required | Default | Source | Notes |
|---|---|---|---|---|
| `LOG_LEVEL` | No | `info` | `packages/observability/src/logger.ts` | Supported values: `debug`, `info`, `warn`, `error`. |
| `PORT` | No | `3000` | Docker/runtime | Server listen port in container or Node hosting environments. |
| `HOSTNAME` | No | `0.0.0.0` | Docker/runtime | Server bind address in container or Node hosting environments. |
| `NEXT_TELEMETRY_DISABLED` | No | `1` | build/runtime | Recommended in CI and production images. |

## Validation Rules

- Build-time validation is intentionally minimal: only `NODE_ENV` is validated at module load.
- Runtime secrets are validated lazily through `getRuntimeEnv()` so CI builds do not require live production secrets.
- `NEXT_PUBLIC_MEDUSA_SERVER_TOKEN` must never be set; the commerce package rejects it explicitly.
- `.env.example` contains placeholder values only and remains the source of local-development defaults.
