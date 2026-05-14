import { pluginStatesManageAccess, pluginStatesReadAccess } from '@/lib/auth/access';
import type { CollectionConfig } from 'payload';

const pluginMigrationStatusOptions = [
  {
    label: 'Pending',
    value: 'pending',
  },
  {
    label: 'Applied',
    value: 'applied',
  },
];

export const PluginStates: CollectionConfig = {
  slug: 'plugin-states',
  admin: {
    hidden: true,
    useAsTitle: 'pluginId',
  },
  access: {
    create: pluginStatesManageAccess,
    delete: () => false,
    read: pluginStatesReadAccess,
    update: pluginStatesManageAccess,
  },
  fields: [
    {
      name: 'pluginId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'pluginVersion',
      type: 'text',
      required: true,
    },
    {
      name: 'enabled',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'enabledModules',
      type: 'array',
      fields: [
        {
          name: 'moduleId',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'activatedAt',
      type: 'date',
    },
    {
      name: 'activatedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'deactivatedAt',
      type: 'date',
    },
    {
      name: 'deactivatedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'migrations',
      type: 'array',
      fields: [
        {
          name: 'migrationId',
          type: 'text',
          required: true,
        },
        {
          name: 'version',
          type: 'text',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'destructive',
          type: 'checkbox',
          required: true,
          defaultValue: false,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: pluginMigrationStatusOptions,
        },
        {
          name: 'executedAt',
          type: 'date',
        },
      ],
    },
  ],
};
