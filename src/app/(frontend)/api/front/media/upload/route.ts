import getAuth from '@/lib/getAuth'
import r2 from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Generate a signed upload URL (PUT)
export async function POST(req: Request) {
  const user = await getAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { filename, contentType } = await req.json()
    if (!filename || !contentType)
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const uniqueId = uuidv4()
    const extMatch = filename.match(/\.[^/.]+$/)
    const ext = extMatch ? extMatch[0] : ''
    const key = `temp/${uniqueId}${ext}`

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    })

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 900 })

    return NextResponse.json({ signedUrl, key, alias: uniqueId })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 })
  }
}
