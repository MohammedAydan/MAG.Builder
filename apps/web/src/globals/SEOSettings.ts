import type { GlobalConfig } from 'payload';
import { hasPermission, type AuthenticatedUserLike } from '@/lib/auth/access';

export const SEOSettings: GlobalConfig = {
  slug: 'seo-settings',
  label: 'SEO Settings',
  access: {
    read: ({ req }) => hasPermission(req.user as AuthenticatedUserLike | undefined, 'content:read'),
    update: ({ req }) => hasPermission(req.user as AuthenticatedUserLike | undefined, 'content:write'),
  },
  admin: {
    group: 'Content',
  },
  fields: [
    { name: 'defaultMetaTitle', type: 'text', maxLength: 120 },
    { name: 'defaultMetaDescription', type: 'textarea', maxLength: 280 },
    { name: 'noIndexByDefault', type: 'checkbox', defaultValue: false },
  ],
};
