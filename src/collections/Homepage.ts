import { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  hooks: {
    afterChange: [
      async () => {
        await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/front/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${process.env.WEBHOOK_SECRET}`,
          },
          body: JSON.stringify({ tags: ['homepage'] }),
        })
      },
    ],
  },
  fields: [
    {
      name: 'featured',
      type: 'array',
      required: false,
      maxRows: 8,
      fields: [
        {
          name: 'article',
          type: 'relationship',
          relationTo: 'article',
          // required: true,
        },
      ],
    },
  ],
}
