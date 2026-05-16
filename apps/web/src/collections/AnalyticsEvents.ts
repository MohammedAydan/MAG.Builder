import type { CollectionConfig } from 'payload';
import { analyticsReadAccess } from '@/lib/auth/access';

export const AnalyticsEvents: CollectionConfig = {
  slug: 'analytics-events',
  admin: {
    useAsTitle: 'name',
    group: 'System & Marketplace',
  },
  access: {
    create: () => false, // Only system can capture
    read: analyticsReadAccess,
    update: () => false,
    delete: analyticsReadAccess,
  },
  fields: [
    {
      name: 'siteId',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'anonymousId',
      type: 'text',
      index: true,
    },
    {
      name: 'sessionId',
      type: 'text',
      index: true,
    },
    {
      name: 'userId',
      type: 'text',
      index: true,
    },
    {
      name: 'path',
      type: 'text',
    },
    {
      name: 'payload',
      type: 'json',
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
  ],
};
