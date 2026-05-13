import type { CollectionConfig } from 'payload';
import { redirectsManageAccess, redirectsReadAccess } from '@/lib/auth/access';
import { createAuditedAfterChangeHook, createAuditedAfterDeleteHook } from '@/lib/content/audit';
import { normalizePathField } from '@/lib/content/hooks';
import { isSafeRedirectDestination } from '@/lib/content/paths';

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    group: 'Content',
    useAsTitle: 'sourcePath',
    defaultColumns: ['sourcePath', 'destinationPath', 'type', 'isActive'],
  },
  access: {
    create: redirectsManageAccess,
    delete: redirectsManageAccess,
    read: redirectsReadAccess,
    update: redirectsManageAccess,
  },
  hooks: {
    afterChange: [createAuditedAfterChangeHook({ collection: 'redirects', labelField: 'sourcePath' })],
    afterDelete: [createAuditedAfterDeleteHook({ collection: 'redirects', labelField: 'sourcePath' })],
  },
  fields: [
    {
      name: 'sourcePath',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [normalizePathField],
      },
      validate: (value: string | null | undefined) => {
        if (!value) {
          return 'Source path is required.';
        }

        return value.startsWith('/') || 'Source path must start with /.';
      },
    },
    {
      name: 'destinationPath',
      type: 'text',
      required: true,
      hooks: {
        beforeValidate: [normalizePathField],
      },
      validate: (value: string | null | undefined) => {
        if (!value) {
          return 'Destination path is required.';
        }

        return isSafeRedirectDestination(value) || 'Destination must be an internal path or http/https URL.';
      },
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: '301',
      options: [
        {
          label: '301 Permanent',
          value: '301',
        },
        {
          label: '302 Temporary',
          value: '302',
        },
      ],
      required: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
};
