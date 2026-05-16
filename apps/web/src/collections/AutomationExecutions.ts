import type { CollectionConfig } from 'payload';
import { automationReadAccess, automationManageAccess } from '@/lib/auth/access';

export const AutomationExecutions: CollectionConfig = {
  slug: 'automation-executions',
  admin: {
    useAsTitle: 'id',
    group: 'Automation',
    hidden: true,
  },
  access: {
    read: automationReadAccess,
    create: () => false,
    update: () => false,
    delete: automationManageAccess,
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
      name: 'rule',
      type: 'relationship',
      relationTo: 'automation-rules',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Success', value: 'success' },
        { label: 'Failure', value: 'failure' },
      ],
    },
    {
      name: 'triggerData',
      type: 'json',
    },
    {
      name: 'results',
      type: 'json',
    },
    {
      name: 'error',
      type: 'text',
    },
    {
      name: 'startedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'durationMs',
      type: 'number',
    },
  ],
};
