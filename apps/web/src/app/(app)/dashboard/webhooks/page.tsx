import { getPayloadClient } from '@/lib/payload';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { SurfaceCard } from '@/components/public/surface-card';

export const dynamic = 'force-dynamic';

interface SubscriptionRecord {
  active?: boolean | null;
  events?: string[] | null;
  id: string | number;
  name: string;
  url: string;
}

interface DeliveryRecord {
  createdAt?: string | null;
  event: string;
  id: string | number;
  errorMessage?: string | null;
  status: string;
  statusCode?: number | null;
  subscription?: string | number | {
    name: string;
  } | null;
}

export default async function WebhooksPage() {
  await requireDashboardUser();
  const payload = await getPayloadClient();

  const [subscriptionsResult, deliveriesResult] = await Promise.all([
    payload.find({
      collection: 'webhook-subscriptions',
      depth: 0,
      limit: 100,
      sort: 'name',
    }),
    payload.find({
      collection: 'webhook-deliveries',
      depth: 1,
      limit: 10,
      sort: '-createdAt',
    }),
  ]);

  const subscriptions = subscriptionsResult.docs as unknown as SubscriptionRecord[];
  const deliveries = deliveriesResult.docs as unknown as DeliveryRecord[];

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Webhooks</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage outbound webhook subscriptions and delivery logs.
          </p>
        </header>

        <div className="grid gap-6">
          <h2 className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">Subscriptions</h2>
          {subscriptions.map((sub) => (
            <SurfaceCard key={sub.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-950 truncate">{sub.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    sub.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {sub.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 text-xs font-mono text-slate-500 break-all">{sub.url}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {sub.events?.map((event) => (
                    <span key={event} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button
                  disabled
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed"
                >
                  Edit
                </button>
              </div>
            </SurfaceCard>
          ))}

          {subscriptions.length === 0 && (
            <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-slate-900">No subscriptions found</p>
              <p className="mt-1 text-sm text-slate-500">Add your first webhook subscription in Payload Studio.</p>
            </SurfaceCard>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">Recent Deliveries</h2>
        <div className="grid gap-4">
          {deliveries.map((delivery) => (
            <SurfaceCard key={delivery.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    delivery.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {delivery.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">{delivery.event}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {delivery.createdAt ? new Date(delivery.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <p className="text-slate-500">
                  To: <span className="font-medium text-slate-700">
                    {typeof delivery.subscription === 'object' && delivery.subscription ? delivery.subscription.name : `ID: ${delivery.subscription}`}
                  </span>
                </p>
                <p className="font-mono text-slate-400">HTTP {delivery.statusCode || 'N/A'}</p>
              </div>

              {delivery.errorMessage && (
                <p className="rounded-lg bg-rose-50 p-2 text-[10px] font-medium text-rose-600 border border-rose-100">
                  {delivery.errorMessage}
                </p>
              )}
            </SurfaceCard>
          ))}

          {deliveries.length === 0 && (
            <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-xs font-medium text-slate-500">No delivery logs yet.</p>
            </SurfaceCard>
          )}
        </div>
      </section>
    </div>
  );
}
