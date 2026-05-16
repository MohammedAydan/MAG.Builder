import type { CollectionConfig } from 'payload';
import { automationReadAccess, automationManageAccess } from '@/lib/auth/access';

export const AutomationRules: CollectionConfig = {
  slug: 'automation-rules',
  admin: {
    useAsTitle: 'name',
    group: 'Forms & Automation',
  },
  access: {
    read: automationReadAccess,
    create: automationManageAccess,
    update: automationManageAccess,
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'trigger',
      type: 'select',
      required: true,
      options: [
        { label: 'Form Submitted', value: 'form_submitted' },
        { label: 'Order Created', value: 'order_created' },
        { label: 'Member Joined', value: 'member_joined' },
        { label: 'Page Published', value: 'page_published' },
      ],
    },
    {
      name: 'conditions',
      type: 'json',
    },
    {
      name: 'actions',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Log Event', value: 'log' },
            { label: 'Send Webhook', value: 'webhook' },
            { label: 'Tag Member', value: 'tag_member' },
          ],
        },
        {
          name: 'config',
          type: 'json',
          required: true,
        },
      ],
    },
  ],
};
