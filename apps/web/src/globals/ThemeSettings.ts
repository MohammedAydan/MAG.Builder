import type { GlobalConfig } from 'payload';
import { hasPermission, type AuthenticatedUserLike } from '@/lib/auth/access';

export const ThemeSettings: GlobalConfig = {
  slug: 'theme-settings',
  label: 'Theme Settings',
  access: {
    read: ({ req }) => hasPermission(req.user as AuthenticatedUserLike | undefined, 'content:read'),
    update: ({ req }) => hasPermission(req.user as AuthenticatedUserLike | undefined, 'content:write'),
  },
  admin: {
    group: 'Content',
  },
  fields: [
    { name: 'defaultTemplate', type: 'text', defaultValue: 'starter-site' },
    {
      name: 'colorScheme',
      type: 'select',
      defaultValue: 'system',
      options: [
        { label: 'System', value: 'system' },
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  ],
};
