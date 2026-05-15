# Forms and Workflows Runbook

## Overview

Phase 29 keeps the Phase 14 forms foundation intact and upgrades the runtime edges:

- form definitions and submissions still live in Payload
- submissions are still validated server-side and protected by a honeypot
- rate limiting now resolves through a `RateLimitStore` boundary
- email workflow actions now resolve through runtime-selected providers
- form submission success now fires automation and outbound platform webhook events

## Runtime Controls

### Rate Limiting

- Default: `NEXPRESS_FORM_RATE_LIMIT_PROVIDER=memory`
- Contract-only option: `NEXPRESS_FORM_RATE_LIMIT_PROVIDER=redis-compatible`
- Current shipped implementation: in-memory fallback only

The default limiter still allows 5 submissions per form per minute per client.
The client identifier is derived from `X-Forwarded-For` (first segment, truncated to 20 chars).
Raw IP addresses are not stored.

### Email

- `NEXPRESS_EMAIL_PROVIDER=stub` keeps the no-op fallback for tests and local installs
- `NEXPRESS_EMAIL_PROVIDER=resend` enables the built-in Resend HTTP provider
- Required for Resend:
  - `RESEND_API_KEY`
  - `NEXPRESS_EMAIL_FROM`
- Optional:
  - `NEXPRESS_EMAIL_REPLY_TO`

Secrets are never exposed to the client, audit metadata, or diagnostic output. Runtime config redaction is handled in `apps/web/src/lib/runtime-services/config.ts`.

## API Notes

### `POST /api/forms/[formId]/submit`

- Authentication: none required
- Content-Type: `application/json`
- Honeypot: `__hp` must be absent or empty
- Rate limit: enforced through the configured `RateLimitStore`
- Validation: all fields validated server-side against the stored form definition
- Success side effects:
  - submission persisted
  - workflow actions executed
  - `form.submitted` automation trigger fired
  - outbound `form.submitted` webhook event enqueued through the in-process queue boundary

## Known Gaps

- The Redis/Valkey-compatible rate-limit contract exists, but no concrete distributed client binding is shipped yet.
- Resend is the only built-in production email provider; SMTP and other providers still require a new adapter.
- No dashboard UI for viewing form submissions.
- No client-side form renderer beyond the existing data-container shell.
- File uploads and paid CAPTCHA remain out of scope.
