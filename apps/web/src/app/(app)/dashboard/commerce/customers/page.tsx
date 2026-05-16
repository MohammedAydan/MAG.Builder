import { requireDashboardUser } from '@/lib/dashboard/guards';
import { listAllCustomers } from '@/lib/commerce';
import { SurfaceCard } from '@/components/public/surface-card';

export const dynamic = 'force-dynamic';

interface CustomerRecord {
  email?: string | null;
  externalCustomerId: string;
  id: string | number;
  member?: string | number | {
    email?: string | null;
    firstName?: string | null;
  } | null;
  provider: string;
}

export default async function CommerceCustomersPage() {
  const user = await requireDashboardUser();
  const customers = await listAllCustomers(user) as unknown as CustomerRecord[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Commerce Customers</h1>
        <p className="mt-2 text-sm text-slate-500">
          View commerce customer mappings and linked platform members.
        </p>
      </header>

      <div className="grid gap-6">
        {customers.map((customer) => (
          <SurfaceCard key={customer.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-950 truncate">{customer.email}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                  {customer.provider}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <p>External ID: <code className="text-xs">{customer.externalCustomerId}</code></p>
                {customer.member && (
                  <p>
                    Member: <span className="text-slate-900 font-medium">
                      {typeof customer.member === 'object' && customer.member
                        ? (customer.member.firstName || customer.member.email)
                        : `ID: ${customer.member}`}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                disabled
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed"
              >
                View Profile
              </button>
            </div>
          </SurfaceCard>
        ))}

        {customers.length === 0 && (
          <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No customers found</p>
            <p className="mt-1 text-sm text-slate-500">Customers will appear here once they register or start a checkout.</p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
