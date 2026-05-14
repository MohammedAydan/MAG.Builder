import { hasPermission, type AuthenticatedUserLike } from '@/lib/auth/access';
import type { DashboardNavItem } from '@/lib/dashboard/types';

export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  {
    description: 'Platform overview and readiness checks.',
    group: 'core',
    href: '/dashboard',
    kind: 'internal',
    permission: 'content:write',
    title: 'Overview',
  },
  {
    description: 'Create draft pages and open the visual builder editor.',
    group: 'core',
    href: '/dashboard/pages',
    kind: 'internal',
    permission: 'content:write',
    title: 'Pages',
  },
  {
    description: 'Open the existing Payload admin route for content operations.',
    group: 'core',
    href: '/admin',
    kind: 'external',
    permission: 'admin:access',
    title: 'Content Studio',
  },
  {
    description: 'System shell for installation, roles, and future privileged settings.',
    group: 'operations',
    href: '/dashboard/settings',
    kind: 'internal',
    permission: 'system:read',
    title: 'Settings',
  },
] as const;

export function getDashboardNavigation(
  user: AuthenticatedUserLike | null | undefined,
): DashboardNavItem[] {
  return DASHBOARD_NAV_ITEMS.filter((item) =>
    item.permission ? hasPermission(user, item.permission) : true,
  );
}
