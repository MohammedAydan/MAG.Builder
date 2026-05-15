import { integrationsManageAccess, integrationsReadAccess } from '@/lib/auth/access';
import type { CollectionConfig } from 'payload';

export const Integrations: CollectionConfig = {
  slug: 'integrations',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
  },
  access: {
    create: integrationsManageAccess,
    read: integrationsReadAccess,
    update: integrationsManageAccess,
    delete: integrationsManageAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      options: [
        { label: 'Medusa', value: 'medusa' },
        { label: 'Stripe', value: 'stripe' },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'config',
      type: 'json',
      admin: {
        description: 'Safe configuration only. DO NOT STORE SECRETS HERE.',
      },
    },
  ],
};
