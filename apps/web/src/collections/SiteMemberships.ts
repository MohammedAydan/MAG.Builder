import type { CollectionConfig } from 'payload';
import { siteMembershipsManageAccess, siteMembershipsReadAccess } from '@/lib/auth/access';

export const SiteMemberships: CollectionConfig = {
  slug: 'site-memberships',
  admin: {
    useAsTitle: 'id',
    group: 'Platform',
    defaultColumns: ['user', 'site', 'role'],
  },
  access: {
    create: siteMembershipsManageAccess,
    read: siteMembershipsReadAccess,
    update: siteMembershipsManageAccess,
    delete: siteMembershipsManageAccess,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'site-editor',
      options: [
        {
          label: 'Site Owner',
          value: 'site-owner',
        },
        {
          label: 'Site Admin',
          value: 'site-admin',
        },
        {
          label: 'Site Editor',
          value: 'site-editor',
        },
      ],
    },
  ],
};
