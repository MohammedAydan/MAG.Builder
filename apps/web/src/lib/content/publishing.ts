import type { CollectionBeforeChangeHook, Field } from 'payload';

export function createPublishedAtField(): Field {
  return {
    name: 'publishedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
      date: {
        pickerAppearance: 'dayAndTime',
      },
    },
  };
}

export const syncPublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const nextStatus = data?._status ?? originalDoc?._status;

  if (nextStatus === 'published' && !data?.publishedAt && !originalDoc?.publishedAt) {
    return {
      ...data,
      publishedAt: new Date().toISOString(),
    };
  }

  return data;
};
