import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import sharp from 'sharp'
import { admins } from './access/admins'
const afterChangeHook: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (doc.lqip) return doc
  try {
    const mediaUrl = doc.sizes?.full?.url ?? doc.url
    const response = await fetch(mediaUrl)
    if (!response.ok) throw new Error(`Failed to fetch media from ${mediaUrl}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    // const metadata = await sharp(buffer).metadata()
    const lqipBuffer = await sharp(buffer).resize(20).blur(8).webp({ quality: 20 }).toBuffer()
    const base64 = `data:image/webp;base64,${lqipBuffer.toString('base64')}`
    await req.payload.update({
      collection: 'user-media',
      id: doc.id,
      data: { lqip: base64 },
    })
  } catch (err) {
    req.payload.logger.error(`❌ LQIP generation failed for ${doc.filename}: ${err}`)
  }
  return doc
}

export const UserMedia: CollectionConfig = {
  slug: 'user-media',
  hooks: {
    afterChange: [afterChangeHook],
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
        description: 'Auto-generated on upload — do not edit manually',
      },
    },
  ],
  access: {
    read: () => true,
    create: admins,
    update: admins,
    delete: admins,
  },
  upload: {
    resizeOptions: {
      width: 1024,
      fit: 'cover',
      height: 1024,
    },
    formatOptions: {
      format: 'avif',
      options: {
        quality: 60,
      },
    },
    adminThumbnail: 'thumbnail',
    imageSizes: [
      {
        formatOptions: {
          format: 'avif',
          options: {
            quality: 50,
          },
        },
        name: 'thumbnail',
        width: 100,
        height: 100,
        fit: 'cover',
      },
      {
        formatOptions: {
          format: 'avif',
          options: {
            quality: 60,
          },
        },
        name: 'small',
        width: 512,
        height: 512,
        fit: 'cover',
      },
    ],
  },
}
