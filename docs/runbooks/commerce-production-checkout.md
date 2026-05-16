# Commerce Production Checkout Runbook

## Scope

Phase 32 introduces a production-checkout foundation with:

- server-side checkout session creation;
- idempotency key handling for checkout session requests;
- signed payment webhook verification;
- safe order lifecycle transitions in `commerce-orders`.

No card data is stored or processed by NexPress.

## Environment variables

- `NEXPRESS_COMMERCE_PROVIDER=medusa`
- `MEDUSA_BACKEND_URL`
- `MEDUSA_DEFAULT_REGION_ID`
- `MEDUSA_PUBLISHABLE_KEY`
- `MEDUSA_SERVER_TOKEN` (server-only)
- `NEXPRESS_COMMERCE_PAYMENT_WEBHOOK_SECRET` (server-only)
- `NEXPRESS_COMMERCE_CHECKOUT_BASE_URL` (optional hosted checkout URL base)

## Checkout session flow

1. Client sends `POST /api/commerce/checkout/session` with `{ "cartId": "..." }`.
2. Client may include `Idempotency-Key` header.
3. Server validates member auth, cart ownership context, and cart non-empty state.
4. Server creates or updates a `commerce-orders` record in `payment_pending` state.
5. Server returns a checkout session payload with server-generated session ID.

## Payment webhook flow

1. Provider sends `POST /api/commerce/webhooks/payment` with signed body.
2. Server verifies `nexpress-signature` using `NEXPRESS_COMMERCE_PAYMENT_WEBHOOK_SECRET`.
3. Server validates payload shape and event type.
4. Server applies only allowed lifecycle transitions.
5. Server records webhook metadata on order and writes audit events.

## Allowed lifecycle transitions

- `draft -> open | payment_pending`
- `open -> payment_pending`
- `payment_pending -> payment_authorized | placed | payment_failed | open`
- `payment_authorized -> placed | payment_failed`
- `payment_failed -> open | payment_pending`
- `placed -> fulfilled`

## Security notes

- Signature verification is mandatory for payment webhooks.
- Server decides order state transitions.
- Totals are read from server-side cart/adapters; client totals are ignored.
- Secrets are not returned to API clients.
