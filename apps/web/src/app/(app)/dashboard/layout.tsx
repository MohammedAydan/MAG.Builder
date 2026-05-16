import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { requireDashboardUser } from '@/lib/dashboard/guards';

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children: _children }: DashboardLayoutProps) {
  await requireDashboardUser();
  redirect('/admin');
}
