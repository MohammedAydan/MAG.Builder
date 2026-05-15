import type { CollectionConfig } from 'payload';
import { contentCreateAccess, contentDeleteAccess, contentUpdateAccess } from '@/lib/auth/access';
import { formDefinitionsAdminReadAccess } from '@/lib/auth/access';

/**
 * Forms collection — stores form definitions.
 *
 * Access:
 * - Read: admin/editor with content:read (NOT public).
 *   Public form definitions are served through a dedicated /api/forms/[formId]/public
 *   route that strips private configuration before responding.
 * - Create/Update/Delete: admin/editor with content:write / content:delete.
 * - Anonymous users cannot read form definitions.
 *
 * Security note: Form definitions may contain workflow action configs (e.g., webhook URLs,
 * email recipients). These must never be exposed to public clients.
 */
export const Forms: CollectionConfig = {
  slug: 'forms',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    create: contentCreateAccess,
    delete: contentDeleteAccess,
    read: formDefinitionsAdminReadAccess,
    update: contentUpdateAccess,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Lowercase alphanumeric and hyphens only. Used to embed this form in pages.',
      },
      validate: (value: string | null | undefined) => {
        if (!value) {
          return 'Slug is required.';
        }

        if (!/^[a-z0-9-]{1,80}$/.test(value)) {
          return 'Slug must be lowercase alphanumeric or hyphens only, 1–80 characters.';
        }

        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 280,
    },
    {
      name: 'fields',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 40,
      admin: {
        description: 'Define the form fields. Field IDs must be unique and lowercase.',
      },
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
          admin: {
            description: 'Unique field identifier — lowercase alphanumeric and underscores.',
          },
          validate: (value: string | null | undefined) => {
            if (!value) return 'Field id is required.';
            if (!/^[a-z0-9_]{1,80}$/.test(value)) {
              return 'Field id must be lowercase alphanumeric or underscores only.';
            }
            return true;
          },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Textarea', value: 'textarea' },
            { label: 'Email', value: 'email' },
            { label: 'Checkbox', value: 'checkbox' },
            { label: 'Select (dropdown)', value: 'select' },
            { label: 'Hidden', value: 'hidden' },
          ],
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          maxLength: 120,
        },
        {
          name: 'placeholder',
          type: 'text',
          maxLength: 160,
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'defaultValue',
          type: 'text',
          maxLength: 120,
          admin: {
            description: 'Only applicable for hidden fields. Value set server-side.',
            condition: (data, siblingData) => siblingData?.type === 'hidden',
          },
        },
        {
          name: 'options',
          type: 'array',
          maxRows: 50,
          admin: {
            description: 'Required for select fields.',
            condition: (data, siblingData) => siblingData?.type === 'select',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              maxLength: 120,
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              maxLength: 80,
              validate: (value: string | null | undefined) => {
                if (!value) return 'Option value is required.';
                if (!/^[a-z0-9_-]+$/.test(value)) {
                  return 'Option value must be lowercase alphanumeric, hyphens, or underscores.';
                }
                return true;
              },
            },
          ],
        },
      ],
    },
    {
      name: 'actions',
      type: 'array',
      maxRows: 10,
      admin: {
        description: 'Workflow actions to execute when this form is submitted.',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Email notification (stub in Phase 14)', value: 'email' },
            { label: 'Webhook POST', value: 'webhook' },
          ],
        },
        {
          name: 'webhookUrl',
          type: 'text',
          maxLength: 500,
          admin: {
            description: 'HTTPS webhook URL. Must use https:// scheme.',
            condition: (data, siblingData) => siblingData?.type === 'webhook',
          },
        },
        {
          name: 'emailTo',
          type: 'email',
          admin: {
            description: 'Recipient email for email notification.',
            condition: (data, siblingData) => siblingData?.type === 'email',
          },
        },
        {
          name: 'emailToName',
          type: 'text',
          maxLength: 120,
          admin: {
            description: 'Recipient display name.',
            condition: (data, siblingData) => siblingData?.type === 'email',
          },
        },
      ],
    },
  ],
};
