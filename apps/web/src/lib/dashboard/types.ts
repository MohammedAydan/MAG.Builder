import type { AppPermission } from '@/lib/auth/permissions';

export type DashboardNavGroup = 'core' | 'operations';

export type DashboardNavItem = {
  description: string;
  group: DashboardNavGroup;
  href: string;
  kind: 'external' | 'internal';
  permission?: AppPermission;
  title: string;
};

export type DashboardIdentity = {
  email: string | null;
  id: number | string;
  role: string | null;
};
