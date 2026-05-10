import { NextRequest, NextResponse } from 'next/server'
import getPayload from '@/lib/payload'
import { verifyWebhook } from '@clerk/nextjs/webhooks'

interface ClerkUser {
  email_addresses: Array<{
    id: string
    email_address: string
    verification: any
    linked_to: any
    object: string
    reserved: boolean
  }>

  first_name: string | null
  has_image: boolean
  id: string
  image_url: string
  last_name: string | null
  profile_image_url: string
}
export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)
    //@ts-ignore
    const data: ClerkUser | null = evt.data
    if (!data) return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })

    const user_id = data.id

    let email = data.email_addresses[0].email_address

    let name = `${data.first_name} ${data.last_name}`.trim()

    const image_url =
      typeof data.profile_image_url === 'string'
        ? data.profile_image_url
        : typeof data.image_url === 'string'
          ? data.image_url
          : null

    const payload = await getPayload()

    if (evt.type === 'user.created') {
      try {
        let uploadedImage = null
        if (image_url) {
          try {
            uploadedImage = await payload.create({
              collection: 'user-media',
              data: {
                url: image_url,
              },
            })
          } catch (mediaErr) {
            uploadedImage = null
          }
        }

        await payload.create({
          collection: 'profiles',
          data: {
            id: user_id,
            email,
            name,
            profile: uploadedImage?.id || null,
          },
        })
        return NextResponse.json({ message: 'Profile created' }, { status: 201 })
      } catch (error) {
        // If profile already exists, ignore conflict
        if (
          error instanceof Error &&
          error.message &&
          error.message.toLowerCase().includes('duplicate')
        ) {
          return NextResponse.json({ message: 'Profile already exists' }, { status: 200 })
        }
        return NextResponse.json(
          {
            error: 'Failed to create profile',
            details: error instanceof Error ? error.message : error,
          },
          { status: 500 },
        )
      }
    }

    // Handle updates (for name/email/image changes)
    if (evt.type === 'user.updated') {
      try {
        // Only update allowed fields
        const updateData: Record<string, any> = {}
        if (typeof name === 'string' && name.length > 0) updateData.name = name
        if (typeof email === 'string' && email.length > 0) updateData.email = email
        if (typeof image_url === 'string' && image_url.length > 0) updateData.image = image_url

        if (Object.keys(updateData).length === 0) {
          return NextResponse.json({ message: 'No fields to update' }, { status: 200 })
        }

        await payload.update({
          collection: 'profiles',
          id: user_id,
          data: updateData,
        })

        return NextResponse.json({ message: 'Profile updated' }, { status: 200 })
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Failed to update profile',
            details: error instanceof Error ? error.message : error,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ error: 'Invalid event type or not supported' }, { status: 400 })
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Webhook verification failed', { status: 400 })
  }
}
