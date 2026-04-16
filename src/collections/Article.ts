import { CollectionConfig } from 'payload'
import { publishedOrAuthorized } from './access/publishedOrAuthorized'
import { checkRole } from './access/checkRole'
import { admins } from './access/admins'
import { generateSlug, revalidate, syncSearch } from './articleHooks'

export const Article: CollectionConfig = {
  slug: 'article',
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    beforeValidate: [generateSlug],
    afterChange: [syncSearch, ({ doc }) => revalidate({ slug: doc.slug })],
    afterDelete: [({ doc }) => revalidate({ slug: doc.slug })],
  },
  defaultPopulate: {
    title: true,
    author: true,
    createdAt: true,
    type: true,
    image: true,
  },
  access: {
    read: publishedOrAuthorized,
    create: ({ req: { user } }) => checkRole(['admin', 'author'], user),
    delete: admins,
    update: admins,
  },
  fields: [
    { type: 'text', name: 'slug', admin: { position: 'sidebar' } },
    { type: 'text', name: 'title', required: true },
    { type: 'text', name: 'description' },
    {
      type: 'select',
      name: 'type',
      options: [
        {
          label: 'Πολιτική',
          value: 'politics',
        },
        {
          label: 'Κοινωνία',
          value: 'society',
        },
        {
          label: 'Πολιτισμός',
          value: 'culture',
        },
        {
          label: 'Ταυτότητα',
          value: 'identity',
        },
        {
          label: 'Περιβάλλον',
          value: 'environment',
        },
        {
          label: 'Τεχνολογία',
          value: 'technology',
        },
        {
          label: 'Εκπαίδευση',
          value: 'education',
        },
        {
          label: 'Φεμινισμός',
          value: 'feminism',
        },
        {
          label: 'Ποίηση',
          value: 'poetry',
        },
        {
          label: 'Προσωπικό',
          value: 'personal',
        },
      ],
    },
    { type: 'relationship', relationTo: 'profiles', name: 'author' },
    {
      type: 'richText',
      name: 'content',
      access: {
        read: ({ data }) => {
          if (data && data.contentRaw) return true
          return false
        },
      },
    },
    {
      name: 'contentRawView', // required
      type: 'ui', // required
      admin: {
        components: {
          Field: '/components/admin/contentRaw',
        },
      },
    },
    {
      type: 'text',
      name: 'contentRaw',
      admin: {
        description: 'This field is only used for external submitters.',
        readOnly: true,
        hidden: true,
      },
    },
    { type: 'upload', relationTo: 'media', name: 'image' },
    {
      type: 'group',
      admin: { position: 'sidebar' },
      name: 'application',
      fields: [
        {
          type: 'select',
          name: 'status',
          options: [
            { value: 'published', label: 'Published' },
            { value: 'pending', label: 'Pending' },
            { value: 'rejected', label: 'Rejected' },
          ],
        },
        {
          type: 'text',
          name: 'reason',
          admin: {
            description: 'In case of rejection this will be shown to the author.',
          },
        },
      ],
    },
  ],
}
