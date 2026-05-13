import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Only authenticated users can read admin users. 
    read: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Email added by default due to auth: true
    // Password added by default
  ],
};
