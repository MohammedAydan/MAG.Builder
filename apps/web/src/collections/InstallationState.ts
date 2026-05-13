import type { CollectionConfig } from 'payload';

export const INSTALLATION_STATE_KEY = 'primary';

export const InstallationState: CollectionConfig = {
  slug: 'installation-state',
  admin: {
    hidden: true,
    useAsTitle: 'siteName',
  },
  access: {
    create: () => false,
    delete: () => false,
    read: () => false,
    update: () => false,
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      defaultValue: INSTALLATION_STATE_KEY,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'installed',
      options: [
        {
          label: 'Installed',
          value: 'installed',
        },
      ],
    },
    {
      name: 'siteName',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 80,
    },
    {
      name: 'adminEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'installedAt',
      type: 'date',
      required: true,
    },
  ],
};
