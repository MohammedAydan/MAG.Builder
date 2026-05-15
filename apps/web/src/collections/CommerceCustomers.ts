import type { CollectionConfig } from 'payload';

export const CommerceCustomers: CollectionConfig = {
  slug: 'commerce-customers',
  admin: {
    hidden: true,
    useAsTitle: 'externalCustomerId',
  },
  access: {
    create: () => false,
    delete: () => false,
    read: () => false,
    update: () => false,
  },
  fields: [
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
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      unique: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'externalCustomerId',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
};
