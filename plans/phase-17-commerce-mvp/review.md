# Phase 17 Review - Commerce MVP

## Summary

Phase 17 extended the existing commerce boundary into a minimal working commerce MVP: server-side catalog reads, authenticated member carts, customer mapping, test-mode checkout, persisted order snapshots, and admin-visible commerce records. The implementation stays behind `commerce-pack`, keeps Medusa as the first provider, and does not start storefront block, payment, shipping, or webhook scope.

## Files changed

- `packages/commerce/*`
- `apps/web/src/lib/commerce/*`
- `apps/web/src/app/api/commerce/**/*`
- `apps/web/src/collections/{CommerceCustomers.ts,CommerceOrders.ts}`
- `apps/web/src/lib/{auth/permissions.ts,auth/access.ts,audit/service.ts}`
- `apps/web/src/{payload.config.ts,payload-types.ts}`
- `.env.example`
- `docs/runbooks/commerce-mvp.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `IMPLEMENTATION_STATUS.md`

## Provider strategy

- Provider direction: Medusa
- Integration model: embedded server-side adapter boundary inside NexPress
- Scope level: Commerce MVP only, with provider-backed catalog/cart/customer reads and a test-mode checkout/order persistence path

## Security considerations

- commerce access still fails closed unless `commerce-pack` is active
- runtime config remains server-only and lazily validated
- cart, checkout, and member-order routes require authenticated members
- customer mappings are stored in a hidden collection and not exposed publicly
- admin order visibility is read-only and limited to `admin` and `super-admin`
- checkout does not handle real cards, payment capture, taxes, shipping, inventory, or coupons in Phase 17

## Known gaps

- guest carts and anonymous checkout are not implemented
- checkout can fall back to a local test-mode order snapshot instead of a provider-finalized order
- no storefront UI blocks or builder commerce components exist yet
- no webhook reconciliation or live inventory/order-sync workflow exists yet
- no live database migration file was generated for the new commerce collections

## Recommendation

- [x] Approve
- [ ] Request changes
