import type { GlobalConfig } from 'payload';
import { hasPermission, type AuthenticatedUserLike } from '@/lib/auth/access';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: ({ req }) => hasPermission(req.user as AuthenticatedUserLike | undefined, 'sites:read'),
    update: ({ req }) => hasPermission(req.user as AuthenticatedUserLike | undefined, 'sites:manage'),
  },
  admin: {
    group: 'Platform',
  },
  fields: [
    { name: 'defaultTheme', type: 'text', defaultValue: 'starter' },
    { name: 'defaultLocale', type: 'text', defaultValue: 'en-US' },
  ],
};
