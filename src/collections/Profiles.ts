import type { CollectionConfig } from 'payload'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'name',
  },
  defaultPopulate: {
    name: true,
    birthday: true,
  },

  fields: [
    {
      name: 'id',
      type: 'text',
      index: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'birthday',
      type: 'date',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'profile',
      type: 'upload',
      relationTo: 'user-media',
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        {
          name: 'link',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
