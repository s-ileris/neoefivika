import { CollectionConfig } from 'payload'
import { publishedOrAuthorized } from './access/publishedOrAuthorized'
import { checkRole } from './access/checkRole'
import { admins } from './access/admins'
import { deleteSearch, generateSlug, requestRevalidation, revalidate, syncSearch } from './articleHooks'

export const Article: CollectionConfig = {
  slug: 'article',
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    beforeValidate: [generateSlug],
    afterChange: [syncSearch, requestRevalidation],
    afterDelete: [({ doc }) => revalidate({ slug: doc.slug, type: doc.type }), deleteSearch],
  },
  defaultPopulate: {
    title: true,
    author: true,
    createdAt: true,
    type: true,
    slug: true,
    image: true,
  },
  access: {
    read: publishedOrAuthorized,
    create: ({ req: { user } }) => checkRole(['admin', 'author'], user),
    delete: admins,
    update: admins,
  },
  fields: [
    { type: 'text', name: 'slug', index: true, admin: { position: 'sidebar' } },
    { type: 'text', name: 'title', required: true },
    { type: 'text', name: 'description' },
    {
      type: 'select',
      name: 'type',
      index: true,
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
        {
          label: 'Showbiz',
          value: 'showbiz',
        },
        {
          label: 'Κριτική',
          value: 'critique',
        },
        {
          label: 'Επιστήμη',
          value: 'science',
        },
        {
          label: 'Μόδα',
          value: 'fashion',
        },
        {
          label: 'Αθλητικά',
          value: 'sport',
        },
      ],
    },
    { type: 'relationship', index: true, relationTo: 'profiles', name: 'author' },
    {
      type: 'richText',
      name: 'content',
      access: {
        read: ({ doc }) => {
          if (doc && doc.contentRaw && doc.contentRaw.length) {
            return false
          }
          return true
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
