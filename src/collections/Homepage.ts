import { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  hooks: {
    afterChange: [
      () => {
        fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/front/revalidate/tag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${process.env.WEBHOOK_SECRET}`,
          },
          body: JSON.stringify({ tag: 'homepage' }),
        })
      },
    ],
    afterRead: [() => console.log('read')],
  },
  fields: [
    {
      name: 'top',
      label: 'Top featured article',
      type: 'relationship',
      relationTo: 'article',
      required: false,
    },
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
