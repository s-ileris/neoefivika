import type { CollectionConfig } from 'payload'
// import sharp from 'sharp'
import { admins } from './access/admins'
// const afterChangeHook: CollectionAfterChangeHook = async ({ doc, req }) => {
//   if (doc.lqip) return doc
//   try {
//     const mediaUrl = doc.sizes?.full?.url ?? doc.url
//     const response = await fetch(mediaUrl)
//     if (!response.ok) throw new Error(`Failed to fetch media from ${mediaUrl}`)
//     const buffer = Buffer.from(await response.arrayBuffer())
//     const lqipBuffer = await sharp(buffer).resize(20).blur(8).webp({ quality: 20 }).toBuffer()
//     const base64 = `data:image/webp;base64,${lqipBuffer.toString('base64')}`
//     await req.payload.update({
//       collection: 'media',
//       id: doc.id,
//       data: { lqip: base64 },
//     })
//   } catch (err) {
//     req.payload.logger.error(`❌ LQIP generation failed for ${doc.filename}: ${err}`)
//   }
//   return doc
// }
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: () => false,
    update: admins,
    delete: admins,
  },
  hooks: {
    // afterChange: [afterChangeHook],
  },
  fields: [
    {
      name: 'lqip',
      type: 'text',
      admin: {
        components: {
          Field: '@/components/admin/LQIPField', // detail view
          Cell: '@/components/admin/LQIPField/Cell', // list view
        },
        description: 'Auto-generated on upload',
      },
    },
  ],
  upload: {
    adminThumbnail: 'small',
    resizeOptions: {
      width: 2500,
      height: undefined,
      withoutEnlargement: true,
    },
    formatOptions: {
      format: 'avif',
      options: {
        quality: 75,
        effort: 4,
      },
    },
    imageSizes: [
      {
        name: 'small',
        width: 800,
        height: undefined,
        formatOptions: {
          format: 'avif',
          options: { quality: 70, effort: 4 },
        },
      },
    ],
  },
}
