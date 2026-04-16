import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Article } from './collections/Article'
import { Profiles } from './collections/Profiles'
import { UserMedia } from './collections/UserMedia'
import { Homepage } from './collections/Homepage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['./components/admin/beforeDashboard'],
    },
  },
  globals: [Homepage],
  collections: [Users, Media, Article, Profiles, UserMedia],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
      authToken: process.env.DATABASE_AUTH || '',
    },
  }),
  sharp,
  upload: {
    limits: {
      fileSize: 2000000,
    },
  },
  plugins: [
    s3Storage({
      collections: {
        media: {
          generateFileURL: ({ filename, prefix }) => {
            const parts = [process.env.CDN_URL, prefix, filename].filter(Boolean)
            return parts.join('/')
          },
          disablePayloadAccessControl: true,
        },
        'user-media': {
          generateFileURL: ({ filename, prefix }) => {
            const parts = [process.env.CDN_URL, prefix, filename].filter(Boolean)
            return parts.join('/')
          },
          prefix: 'u',
          disablePayloadAccessControl: true,
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET || '',
        },
        region: 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
      },
    }),
    searchPlugin({
      collections: ['article'],
      searchOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'description',
            type: 'textarea',
          },
        ],
      },

      beforeSync: ({ originalDoc, searchDoc }) => ({
        ...searchDoc,
        title: originalDoc.title,
        description: originalDoc?.description || '',
      }),
    }),
  ],
})
