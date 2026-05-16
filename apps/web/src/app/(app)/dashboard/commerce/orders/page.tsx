import { requireDashboardUser } from '@/lib/dashboard/guards';
import { listAllOrders } from '@/lib/commerce/service';
import { SurfaceCard } from '@/components/public/surface-card';

export const dynamic = 'force-dynamic';

interface OrderRecord {
  checkoutIdempotencyKey?: string | null;
  currencyCode: string;
  customerEmail: string;
  externalCustomerId: string;
  externalOrderId: string;
  id: string | number;
  lineItems?: {
    currencyCode?: string | null;
    quantity?: number | null;
    title?: string | null;
    totalAmount?: number | null;
  }[] | null;
  paymentSessionId?: string | null;
  paymentWebhookEventId?: string | null;
  paymentMode: string;
  placedAt: string;
  status: string;
  totalAmount: number;
}

export default async function CommerceOrdersPage() {
  const user = await requireDashboardUser();
  const orders = await listAllOrders(user) as unknown as OrderRecord[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Commerce Orders</h1>
        <p className="mt-2 text-sm text-slate-500">
          View and manage snapshots of commerce orders.
        </p>
      </header>

      <div className="grid gap-4">
        {orders.map((order) => (
          <SurfaceCard key={order.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  order.status === 'placed' || order.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                }`}>
                  {order.status}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {order.externalOrderId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {new Date(order.placedAt).toLocaleString()}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Customer</p>
                <p className="mt-1 text-sm text-slate-900">{order.customerEmail}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{order.externalCustomerId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Financials</p>
                <p className="mt-1 text-sm font-bold text-slate-950">
                  {(order.totalAmount / 100).toFixed(2)} {order.currencyCode.toUpperCase()}
                </p>
                <p className="text-[10px] text-slate-400 uppercase mt-0.5">{order.paymentMode} mode</p>
                {order.paymentSessionId && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    session: {order.paymentSessionId}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Items</p>
                <p className="mt-1 text-sm text-slate-900">{order.lineItems?.length ?? 0} items</p>
              </div>
            </div>

            {(order.checkoutIdempotencyKey || order.paymentWebhookEventId) && (
              <div className="rounded-xl border border-slate-100 bg-white p-3">
                {order.checkoutIdempotencyKey && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    idempotency: {order.checkoutIdempotencyKey}
                  </p>
                )}
                {order.paymentWebhookEventId && (
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    webhook event: {order.paymentWebhookEventId}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="space-y-2">
                {order.lineItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      <span className="font-bold text-slate-900">{item.quantity}x</span> {item.title}
                    </span>
                    <span className="font-medium text-slate-900">
                      {((item.totalAmount ?? 0) / 100).toFixed(2)} {(item.currencyCode || order.currencyCode).toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SurfaceCard>
        ))}

        {orders.length === 0 && (
          <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No orders found</p>
            <p className="mt-1 text-sm text-slate-500">Orders will appear here once customers place them.</p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
