import type { CollectionConfig } from 'payload';
import {
  contentCreateAccess,
  contentDeleteAccess,
  contentUpdateAccess,
  publishedContentReadAccess,
} from '@/lib/auth/access';
import { createAuditedAfterChangeHook, createAuditedAfterDeleteHook } from '@/lib/content/audit';
import { createContentAccessField } from '@/lib/content/access-fields';
import { populateSlugFromSiblingData } from '@/lib/content/hooks';
import { createPublishedAtField, syncPublishedAt } from '@/lib/content/publishing';
import { createSeoFields } from '@/lib/content/seo';
import { isSafeSlugSegment } from '@/lib/content/slug';
import { createSiteRelationshipField } from '@/lib/sites/fields';

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'publishedAt'],
  },
  access: {
    create: contentCreateAccess,
    delete: contentDeleteAccess,
    read: publishedContentReadAccess,
    update: contentUpdateAccess,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [syncPublishedAt],
    afterChange: [createAuditedAfterChangeHook({ collection: 'posts' })],
    afterDelete: [createAuditedAfterDeleteHook({ collection: 'posts' })],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [populateSlugFromSiblingData],
      },
      validate: (value: string | null | undefined) => {
        if (!value) {
          return 'Slug is required.';
        }

        return isSafeSlugSegment(value) || 'Slug must contain lowercase letters, numbers, and hyphens only.';
      },
    },
    createPublishedAtField(),
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 280,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    createSiteRelationshipField(),
    createContentAccessField(),
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    ...createSeoFields(),
  ],
};
