import type { CollectionConfig } from 'payload';
import { mediaManageAccess, mediaReadAccess } from '@/lib/auth/access';
import { createAuditedAfterChangeHook, createAuditedAfterDeleteHook } from '@/lib/content/audit';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    useAsTitle: 'alt',
  },
  access: {
    create: mediaManageAccess,
    delete: mediaManageAccess,
    read: mediaReadAccess,
    update: mediaManageAccess,
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
  },
  hooks: {
    afterChange: [createAuditedAfterChangeHook({ collection: 'media', labelField: 'alt' })],
    afterDelete: [createAuditedAfterDeleteHook({ collection: 'media', labelField: 'alt' })],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
  ],
};
