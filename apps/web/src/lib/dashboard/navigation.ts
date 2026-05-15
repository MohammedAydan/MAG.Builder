import { hasPermission, type AuthenticatedUserLike } from '@/lib/auth/access';
import type { DashboardNavItem } from '@/lib/dashboard/types';

export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  {
    description: 'Platform overview and readiness checks.',
    group: 'system',
    href: '/dashboard',
    kind: 'internal',
    permission: 'content:read',
    title: 'Overview',
  },
  {
    description: 'Manage draft pages and visual editing.',
    group: 'content',
    href: '/dashboard/pages',
    kind: 'internal',
    permission: 'content:write',
    title: 'Pages',
  },
  {
    description: 'Advanced content operations in Payload Studio.',
    group: 'content',
    href: '/admin',
    kind: 'external',
    permission: 'admin:access',
    title: 'Content Studio',
  },
  {
    description: 'Manage commerce orders and snapshots.',
    group: 'commerce',
    href: '/dashboard/commerce/orders',
    kind: 'internal',
    permission: 'commerce:read',
    title: 'Orders',
  },
  {
    description: 'View commerce customer mappings.',
    group: 'commerce',
    href: '/dashboard/commerce/customers',
    kind: 'internal',
    permission: 'commerce:read',
    title: 'Customers',
  },
  {
    description: 'Manage site configurations and domains.',
    group: 'members-sites',
    href: '/dashboard/sites',
    kind: 'internal',
    permission: 'system:read',
    title: 'Sites',
  },
  {
    description: 'Manage forms and view submissions.',
    group: 'forms',
    href: '/dashboard/forms',
    kind: 'internal',
    permission: 'forms:read',
    title: 'Forms',
  },
  {
    description: 'Manage automation rules and triggers.',
    group: 'automation',
    href: '/dashboard/automation',
    kind: 'internal',
    permission: 'automation:read',
    title: 'Automation',
  },
  {
    description: 'Manage third-party integrations.',
    group: 'integrations',
    href: '/dashboard/integrations',
    kind: 'internal',
    permission: 'integrations:read',
    title: 'Integrations',
  },
  {
    description: 'Manage outbound webhooks.',
    group: 'integrations',
    href: '/dashboard/webhooks',
    kind: 'internal',
    permission: 'webhooks:read',
    title: 'Webhooks',
  },
  {
    description: 'Manage installed plugins and states.',
    group: 'marketplace',
    href: '/dashboard/plugins',
    kind: 'internal',
    permission: 'plugins:read',
    title: 'Plugins',
  },
  {
    description: 'Browse the module marketplace.',
    group: 'marketplace',
    href: '/dashboard/marketplace',
    kind: 'internal',
    permission: 'marketplace:read',
    title: 'Marketplace',
  },
  {
    description: 'System configuration and diagnostics.',
    group: 'system',
    href: '/dashboard/settings',
    kind: 'internal',
    permission: 'system:read',
    title: 'Settings',
  },
  {
    description: 'View platform analytics and usage.',
    group: 'system',
    href: '/dashboard/analytics',
    kind: 'internal',
    permission: 'analytics:read',
    title: 'Analytics',
  },
  {
    description: 'Manage search indexing and status.',
    group: 'system',
    href: '/dashboard/search',
    kind: 'internal',
    permission: 'search:read',
    title: 'Search',
  },
] as const;

export function getDashboardNavigation(
  user: AuthenticatedUserLike | null | undefined,
): DashboardNavItem[] {
  return DASHBOARD_NAV_ITEMS.filter((item) =>
    item.permission ? hasPermission(user, item.permission) : true,
  );
}
