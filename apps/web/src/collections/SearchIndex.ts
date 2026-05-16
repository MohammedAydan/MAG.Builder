import type { CollectionConfig } from 'payload';
import { searchReadAccess } from '@/lib/auth/access';

export const SearchIndex: CollectionConfig = {
  slug: 'search-index',
  admin: {
    useAsTitle: 'title',
    group: 'System & Marketplace',
  },
  access: {
    create: () => false, // Only system can create
    read: searchReadAccess,
    update: () => false,
    delete: searchReadAccess,
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
      name: 'documentId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'type',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'published',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
        { label: 'Private', value: 'private' },
      ],
      required: true,
    },
    {
      name: 'lastIndexedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
  ],
  indexes: [
    {
      fields: ['siteId', 'type', 'documentId'],
      unique: true,
    },
  ],
};
