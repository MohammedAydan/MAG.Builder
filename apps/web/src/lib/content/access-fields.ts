import type { Field } from 'payload';

export const CONTENT_ACCESS_LEVELS = ['public', 'members'] as const;

export type ContentAccessLevel = (typeof CONTENT_ACCESS_LEVELS)[number];

export function createContentAccessField(): Field {
  return {
    name: 'accessLevel',
    type: 'select',
    defaultValue: 'public',
    required: true,
    admin: {
      description: 'Public content is anonymous-safe. Members-only content requires a signed-in member session.',
      position: 'sidebar',
    },
    options: [
      {
        label: 'Public',
        value: 'public',
      },
      {
        label: 'Members',
        value: 'members',
      },
    ],
  };
}
