# Phase 20 Review: Webhooks and Integrations

## Overview

This review document verifies that Phase 20 (Webhooks and Integrations) satisfies all requirements defined in `plan.md` and aligns with the project's security and architecture constraints.

## Verification Checklist

### 1. Webhook Registry
- [x] `@nexpress/webhooks` created to export standard platform webhook event names.
- [x] Zod-based payload schemas enforce strong typing on emitted event bodies.
- [x] Registry structure enables clean separation from application code.

### 2. Signing and Delivery
- [x] `packages/webhooks/src/signing.ts` implements secure HMAC-SHA256 signature generation and verification.
- [x] `generateSignature` embeds a secure timestamp.
- [x] `verifySignature` enforces a strict 5-minute replay window tolerance.
- [x] Outbound service (`apps/web/src/lib/webhooks/outbound.ts`) handles synchronous delivery safely with SSRF protection (private/localhost IPs rejected).

### 3. Retry Model
- [x] `WebhookSubscriptions` collection tracks target URLs and enabled events.
- [x] `WebhookDeliveries` collection stores immutable logs of every attempt, including response body, status code, success state, and error messages.
- [x] Forms a resilient model for future background-queue retries.

### 4. Integration Events
- [x] `Integrations` collection created to act as a configuration registry.
- [x] Stores sensitive data such as webhook secrets, gated strictly behind the `integrations:manage` permission.
- [x] Inbound endpoint (`apps/web/src/app/api/webhooks/inbound/route.ts`) safely verifies HMAC signatures based on the requested integration's secret.

### 5. Security Gates
- [x] Typechecks, tests, and linting all pass (verified via `pnpm check`).
- [x] No raw database adapters introduced; all storage relies on Payload CMS collections.
- [x] RBAC strictly gates webhook subscriptions and integration configs to admins.

## Future Phase Handoff

Phase 20 implements the secure boundaries and synchronous foundations. 
In a future phase (e.g., Phase 22 or Observability), the `deliverWebhook` function will be updated to push events into a background queue (e.g., BullMQ) rather than executing inline during request handling.
