import { after, NextResponse } from 'next/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import r2 from '@/lib/r2'
import getPayload from '@/lib/payload'

export async function POST(req: Request) {
  const { id, large, small, lqip, collection, key } = await req.json()

  const secret = req.headers.get('Secret')

  if (secret !== process.env.IMAGE_RESIZE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if ((collection !== 'media' && collection !== 'user-media') || !key)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  after(async () => {
    const payload = await getPayload()
    try {
      const updateData: any = {
        lqip: lqip,
        url: large.url,
        mimeType: 'image/avif',
        filesize: large.filesize,
        filename: large.url.split('/').pop(),
        width: large.width,
        height: large.height,
        thumbnail_u_r_l: small?.url || large.url,
      }

      if (collection === 'media') {
        if (small) {
          updateData.sizes = {
            small: {
              url: small.url,
              width: small.width,
              height: small.height,
              mimeType: 'image/avif',
              filename: small.url.split('/').pop(),
              filesize: small.filesize,
            },
          }
        }

        await payload.db.updateOne({
          collection: 'media',
          id,
          data: updateData,
        })
        console.error('Update data:', updateData)
      } else {
        if (small) {
          updateData.sizes = {
            thumbnail: {
              url: small.url,
              width: small.width,
              height: small.height,
              mimeType: 'image/avif',
              filename: small.url.split('/').pop(),
              filesize: small.filesize,
            },
          }
        }

        await payload.db.updateOne({
          collection: 'user-media',
          id,
          data: updateData,
        })
      }

      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      })

      await r2.send(command)
    } catch (e) {
      console.error('Payload Update Error:', e)
    }
  })

  //@ts-ignore
  return NextResponse.json('ok')
}
