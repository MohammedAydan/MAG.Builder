import type { GlobalConfig } from 'payload';
import { hasPermission, type AuthenticatedUserLike } from '@/lib/auth/access';

export const SystemSettings: GlobalConfig = {
  slug: 'system-settings',
  label: 'System Settings',
  access: {
    read: ({ req }) => hasPermission(req.user as AuthenticatedUserLike | undefined, 'system:read'),
    update: ({ req }) => hasPermission(req.user as AuthenticatedUserLike | undefined, 'system:install'),
  },
  admin: {
    group: 'System',
  },
  fields: [
    { name: 'maintenanceMode', type: 'checkbox', defaultValue: false },
    { name: 'registrationEnabled', type: 'checkbox', defaultValue: true },
    { name: 'defaultSiteId', type: 'text' },
  ],
};
