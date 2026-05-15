import type { AppPermission } from '@/lib/auth/permissions';

export type DashboardNavGroup =
  | 'content'
  | 'commerce'
  | 'members-sites'
  | 'forms'
  | 'automation'
  | 'integrations'
  | 'marketplace'
  | 'system';

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
