# Forms and Workflows Runbook

## Overview

Phase 14 adds a forms and workflows foundation to NexPress. This includes:

- Form definition storage (Payload `forms` collection)
- Submission storage (Payload `form-submissions` collection)
- Server-side field validation and sanitization
- Honeypot anti-spam
- In-memory rate limiting (5 submissions/form/minute)
- Email action stub (no-op until a provider is configured)
- Webhook action with SSRF protections
- `core.form` builder block (slug-reference based, no inline data)
- Public API route for safe form definition projection
- Submission API route with full server-side validation

---

## Collections

### `forms`

Stores form definitions. **Not publicly readable.**

Access:
- Read: `content:read` or `forms:read` (admin/editor only)
- Create/Update: `content:write`
- Delete: `content:delete`

Fields: `title`, `slug`, `description`, `fields[]`, `actions[]`

### `form-submissions`

Stores validated submissions. **Not publicly readable or writable via Payload API.**

Access:
- Create: always denied via Payload API (server-side service only, uses `overrideAccess: true` after validation)
- Read: `content:read` (admin/editor only)
- Update: always denied (submissions are immutable)
- Delete: `content:delete`

---

## API Routes

### `GET /api/forms/[formId]/public`

Returns the public-safe projection of a form definition by slug.

- Returns: `{ form: { slug, title, description, fields[] } }`
- Does NOT return: `actions`, webhook URLs, email recipients, or internal config
- Authentication: none required
- formId must match `[a-z0-9-]{1,80}` pattern

### `POST /api/forms/[formId]/submit`

Accepts a form submission.

- Authentication: none required (public endpoint)
- Content-Type: `application/json` required
- Honeypot: `__hp` field must be absent or empty
- Rate limit: 5 requests/form/minute per client (in-memory, single-process)
- Validation: all fields validated server-side against the form definition
- Unknown fields: rejected with 422
- Response: `{ success: true }` on success, `{ errors: [] }` or `{ error: "" }` on failure
- HTTP status: 200, 400, 415, 422, 429, 500

---

## Form Builder Block (`core.form`)

Added to `@nexpress/builder-core`. References a form by its slug only:

```json
{
  "type": "core.form",
  "props": {
    "formSlug": "contact",
    "title": "Contact Us",
    "submitLabel": "Send Message"
  }
}
```

The public renderer renders a `data-form-slug` container. Client-side hydration
(future phase) reads this attribute and fetches the form definition from `/api/forms/[slug]/public`.

---

## Spam / Abuse Controls

### Honeypot

Submit requests may include a hidden `__hp` field in the JSON body. If the field is present
and non-empty, the server returns a fake `{ success: true }` response to avoid alerting bots.
Normal users will never fill the honeypot.

To add the honeypot to a client form, include an input with `name="__hp"` styled as
`display: none` or `aria-hidden="true"`.

### Rate Limiting

The in-memory rate limiter allows 5 submissions per form per minute per client.
The client identifier is derived from `X-Forwarded-For` (first segment, truncated to 20 chars).
Raw IP addresses are not stored.

**Known limitation:** The rate limiter is process-local and does not share state across
multiple Node.js processes or edge runtimes. A distributed store (e.g., Redis) is required
for multi-process deployments. See `packages/forms/src/rate-limit.ts` for documentation.

---

## Email Actions

Phase 14 ships a stub email provider that no-ops and logs a warning.
To enable real email delivery:

1. Integrate an email provider (e.g., Resend, SendGrid, SMTP) in a future phase.
2. Implement the `EmailProvider` interface from `@nexpress/forms`.
3. Configure `EMAIL_PROVIDER_*` environment variables.
4. Pass the provider to `executeWorkflowActions` in the forms service.

**No secrets are exposed in logs, audit metadata, or API responses.**

---

## Webhook Actions

Webhook actions POST a JSON payload to a configured HTTPS URL when a form is submitted.

SSRF protections:
- Only `https://` scheme is accepted.
- Localhost, 0.0.0.0, loopback IPs are blocked.
- Private IPv4 ranges (10.x, 172.16-31.x, 192.168.x) are blocked.
- Link-local (169.254.x) and CGNAT (100.64-127.x) are blocked.
- Cloud metadata service addresses (169.254.169.254, metadata.google.internal) are blocked.
- Redirects are disabled.
- Timeout: 10 seconds.
- Payload size: 32 KB max.
- Webhook responses are never returned to clients.

---

## Security Notes

- Form definitions are never publicly readable.
- Submissions are never publicly readable or writable via Payload API.
- The submission route performs server-side validation before any DB write.
- No secrets (DATABASE_URL, PAYLOAD_SECRET, API keys) are stored in submissions, logs, or responses.
- Validation errors use generic messages that do not leak implementation details.
- The rate limiter uses minimized identifiers, not raw IPs.

---

## Known Gaps (Phase 14)

- No email provider is configured; email actions are stubs.
- Rate limiter is in-memory and not distributed.
- No client-side form rendering component yet (forms render as data containers).
- No dashboard UI for viewing form submissions.
- No live Payload migration file (requires live DB).
- File upload fields are out of scope.
- Paid CAPTCHA integration is out of scope.
