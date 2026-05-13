import { auditLogsReadAccess } from '@/lib/auth/access';
import type { CollectionConfig } from 'payload';

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    hidden: true,
    useAsTitle: 'action',
  },
  access: {
    create: () => false,
    delete: () => false,
    read: auditLogsReadAccess,
    update: () => false,
  },
  fields: [
    {
      name: 'action',
      type: 'text',
      required: true,
    },
    {
      name: 'actorUser',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'actorEmail',
      type: 'email',
    },
    {
      name: 'actorRole',
      type: 'select',
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
    {
      name: 'actorSource',
      type: 'select',
      required: true,
      defaultValue: 'system',
      options: [
        { label: 'System', value: 'system' },
        { label: 'User', value: 'user' },
        { label: 'Anonymous', value: 'anonymous' },
      ],
    },
    {
      name: 'targetCollection',
      type: 'text',
    },
    {
      name: 'targetId',
      type: 'text',
    },
    {
      name: 'result',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Failure', value: 'failure' },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
    },
    {
      name: 'occurredAt',
      type: 'date',
      required: true,
    },
  ],
};
