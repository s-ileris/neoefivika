import getAuth from '@/lib/getAuth'
import getPayload from '@/lib/payload'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const user = await getAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { filename, filesize, mimeType, key, collection, alias } = await req.json()
    const url = process.env.CDN_URL + '/' + key
    if (collection !== 'media' && collection !== 'user-media')
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 })
    if (!filename || !url || !key || !alias) {
      return NextResponse.json({ error: 'Missing required file metadata' }, { status: 400 })
    }

    const payload = await getPayload()

    let id = null

    try {
      const res = await payload.db.create({
        collection: collection,
        data: {
          filesize,
          mimeType,
          url,
        },
        returning: true,
      })
      id = res.id
    } catch (e) {
      console.error(e)
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
    console.log('REQUESTING RESIZE')
    try {
      await fetch(
        `${process.env.IMAGE_RESIZE_URL}/${collection === 'media' ? 'media' : 'user-media'}`,
        {
          method: 'POST',
          body: JSON.stringify({
            id,
            url,
            key,
            alias,
          }),
          headers: {
            'Content-Type': 'application/json',
            Secret: process.env.IMAGE_RESIZE_SECRET!,
          },
        },
      )
    } catch (e) {
      console.error(e)
      return NextResponse.json({
        id: id,
      })
    }
    return NextResponse.json({
      id: id,
    })
  } catch (error) {
    console.error('Error registering direct upload:', error)
    return NextResponse.json({ error: 'Failed to register file in Payload' }, { status: 500 })
  }
}
