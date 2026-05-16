import { webhooksManageAccess, webhooksReadAccess } from '@/lib/auth/access';
import type { CollectionConfig } from 'payload';

export const WebhookDeliveries: CollectionConfig = {
  slug: 'webhook-deliveries',
  admin: {
    useAsTitle: 'id',
    group: 'System & Marketplace',
    defaultColumns: ['id', 'subscription', 'event', 'status', 'createdAt'],
  },
  access: {
    create: () => false, // Only system creates these
    read: webhooksReadAccess,
    update: () => false,
    delete: webhooksManageAccess,
  },
  fields: [
    {
      name: 'subscription',
      type: 'relationship',
      relationTo: 'webhook-subscriptions',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'event',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'payload',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
        description: 'Safe payload without secrets',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'statusCode',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'responseBody',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'errorMessage',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
};
