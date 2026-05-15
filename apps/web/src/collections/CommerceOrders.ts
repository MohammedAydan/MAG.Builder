import type { CollectionConfig } from 'payload';
import { commerceReadAccess } from '@/lib/auth/access';
import { createSiteRelationshipField } from '@/lib/sites/fields';

const orderStatusOptions = [
  {
    label: 'Draft',
    value: 'draft',
  },
  {
    label: 'Open',
    value: 'open',
  },
  {
    label: 'Placed',
    value: 'placed',
  },
  {
    label: 'Fulfilled',
    value: 'fulfilled',
  },
];

export const CommerceOrders: CollectionConfig = {
  slug: 'commerce-orders',
  admin: {
    defaultColumns: ['externalOrderId', 'status', 'currencyCode', 'totalAmount', 'placedAt'],
    group: 'Commerce',
    useAsTitle: 'externalOrderId',
  },
  access: {
    create: () => false,
    delete: () => false,
    read: commerceReadAccess,
    update: () => false,
  },
  fields: [
    createSiteRelationshipField(),
    {
      name: 'provider',
      type: 'select',
      required: true,
      defaultValue: 'medusa',
      options: [
        {
          label: 'Medusa',
          value: 'medusa',
        },
      ],
    },
    {
      name: 'externalOrderId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'externalCartId',
      type: 'text',
    },
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'externalCustomerId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'placed',
      options: orderStatusOptions,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'currencyCode',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'subtotalAmount',
      type: 'number',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'paymentMode',
      type: 'select',
      required: true,
      defaultValue: 'test',
      options: [
        {
          label: 'Test',
          value: 'test',
        },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'placedAt',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lineItems',
      type: 'array',
      admin: {
        description: 'Safe order snapshot recorded at test checkout time.',
        readOnly: true,
      },
      fields: [
        {
          name: 'productExternalId',
          type: 'text',
          required: true,
        },
        {
          name: 'variantExternalId',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
        },
        {
          name: 'unitAmount',
          type: 'number',
          required: true,
        },
        {
          name: 'totalAmount',
          type: 'number',
          required: true,
        },
        {
          name: 'currencyCode',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
