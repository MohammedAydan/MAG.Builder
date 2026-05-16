import type { CollectionConfig } from 'payload';
import { siteMembershipsManageAccess } from '@/lib/auth/access';

export const SiteInvitations: CollectionConfig = {
  slug: 'site-invitations',
  admin: {
    useAsTitle: 'email',
    group: 'SaaS Control Plane',
    defaultColumns: ['email', 'site', 'role', 'status'],
  },
  access: {
    create: siteMembershipsManageAccess,
    read: siteMembershipsManageAccess,
    update: () => false,
    delete: siteMembershipsManageAccess,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
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
          label: 'Site Admin',
          value: 'site-admin',
        },
        {
          label: 'Site Editor',
          value: 'site-editor',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Accepted',
          value: 'accepted',
        },
        {
          label: 'Expired',
          value: 'expired',
        },
      ],
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      hidden: true,
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
  ],
};
