import type { CollectionConfig } from 'payload';
import { sitesManageAccess, sitesReadAccess } from '@/lib/auth/access';
import { DEFAULT_SITE_ID, DEFAULT_SITE_SLUG, isValidSiteSlug, normalizeHostname, normalizeSiteSlug, validateDomainHostname } from '@/lib/sites/model';

export const Sites: CollectionConfig = {
  slug: 'sites',
  admin: {
    hidden: false,
    useAsTitle: 'name',
    group: 'SaaS Control Plane',
  },
  access: {
    create: sitesManageAccess,
    delete: sitesManageAccess,
    read: sitesReadAccess,
    update: sitesManageAccess,
  },
  fields: [
    {
      name: 'siteId',
      type: 'text',
      required: true,
      unique: true,
      defaultValue: DEFAULT_SITE_ID,
      hooks: {
        beforeValidate: [
          ({ siblingData, value }) => normalizeSiteSlug(String(value ?? siblingData?.slug ?? DEFAULT_SITE_ID)),
        ],
      },
      validate: (value: string | null | undefined) => {
        if (!value) {
          return 'Site id is required.';
        }

        return isValidSiteSlug(value) || 'Site id must be lowercase kebab-case and cannot use reserved values.';
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      defaultValue: DEFAULT_SITE_SLUG,
      hooks: {
        beforeValidate: [
          ({ siblingData, value }) => normalizeSiteSlug(String(value ?? siblingData?.siteId ?? DEFAULT_SITE_SLUG)),
        ],
      },
      validate: (value: string | null | undefined) => {
        if (!value) {
          return 'Slug is required.';
        }

        return isValidSiteSlug(value) || 'Slug must be lowercase kebab-case and cannot use reserved values.';
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 80,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Suspended',
          value: 'suspended',
        },
      ],
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'domains',
      type: 'array',
      labels: {
        plural: 'Domains',
        singular: 'Domain',
      },
      fields: [
        {
          name: 'hostname',
          type: 'text',
          required: true,
          hooks: {
            beforeValidate: [({ value }) => (typeof value === 'string' ? normalizeHostname(value) : value)],
          },
          validate: (
            value: string | null | undefined,
            { siblingData }: { siblingData?: { developmentOnly?: boolean | null } },
          ) => {
            if (!value) {
              return 'Hostname is required.';
            }

            return validateDomainHostname(value, Boolean(siblingData?.developmentOnly));
          },
        },
        {
          name: 'primary',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'developmentOnly',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'verificationStatus',
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Verified', value: 'verified' },
            { label: 'Failed', value: 'failed' },
          ],
        },
        {
          name: 'verificationToken',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'themeId',
          type: 'text',
        },
        {
          name: 'allowedPlugins',
          type: 'array',
          fields: [
            {
              name: 'pluginId',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
};
