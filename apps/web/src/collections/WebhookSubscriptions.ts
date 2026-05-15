import { webhooksManageAccess, webhooksReadAccess } from '@/lib/auth/access';
import type { CollectionConfig } from 'payload';
import { WebhookEventNames } from '@nexpress/webhooks';

export const WebhookSubscriptions: CollectionConfig = {
  slug: 'webhook-subscriptions',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
  },
  access: {
    create: webhooksManageAccess,
    read: webhooksReadAccess,
    update: webhooksManageAccess,
    delete: webhooksManageAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: (val: string | null | undefined) => {
        // Safe check without importing the node/schema directly to the client if needed,
        // but here it's fine since it's a server-side config for Payload.
        // WebhookUrlSchema.safeParse(val) could be used if we imported it.
        // For now, simple URL regex:
        if (!val) return 'URL is required';
        if (!val.startsWith('https://') && !val.startsWith('http://')) return 'Must be a valid HTTP/HTTPS URL';
        return true;
      },
    },
    {
      name: 'secret',
      type: 'text',
      admin: {
        description: 'Used to sign outbound webhooks. Keep this secret.',
      },
    },
    {
      name: 'events',
      type: 'select',
      hasMany: true,
      required: true,
      options: WebhookEventNames.options.map(event => ({ label: event, value: event })),
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
};
