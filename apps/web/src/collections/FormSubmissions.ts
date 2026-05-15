import type { CollectionConfig } from 'payload';
import { hasPermission, type AuthenticatedUserLike } from '@/lib/auth/access';
import { createSiteRelationshipField } from '@/lib/sites/fields';
import type { Access } from 'payload';

/**
 * FormSubmissions collection — stores validated form submissions.
 *
 * Access:
 * - Create: denied through Payload collection access. Submissions are created
 *   exclusively through the validated /api/forms/[formId]/submit route handler
 *   which uses overrideAccess: true with server-side validation before persisting.
 *   Public users cannot create submissions directly through the Payload API.
 * - Read: content:read (admin/editor) only. Public users cannot read submissions.
 * - Update: denied. Submissions are immutable after creation.
 * - Delete: content:delete (admin/editor) only.
 *
 * Security note: Submissions may contain personal data (name, email). Access is
 * strictly limited to authenticated admin/editor users. Anonymous users must
 * never be able to read, list, or update any submission.
 */

const submissionsReadAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'content:read');

const submissionsDeleteAccess: Access = ({ req }) =>
  hasPermission(req.user as AuthenticatedUserLike | undefined, 'content:delete');

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    group: 'Content',
    useAsTitle: 'formSlug',
    defaultColumns: ['formSlug', 'status', 'submittedAt'],
  },
  access: {
    /** Public users must never create submissions directly via Payload API. */
    create: () => false,
    delete: submissionsDeleteAccess,
    read: submissionsReadAccess,
    update: () => false,
  },
  fields: [
    {
      name: 'formSlug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'fields',
      type: 'json',
      admin: {
        description: 'Validated field values. Read-only after submission.',
        readOnly: true,
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'received',
      options: [
        { label: 'Received', value: 'received' },
        { label: 'Processed', value: 'processed' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'workflowResults',
      type: 'json',
      admin: {
        description: 'Safe workflow execution metadata. Does not contain secrets or webhook responses.',
        readOnly: true,
      },
    },
    createSiteRelationshipField(),
  ],
};
