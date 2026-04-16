import { NextRequest, NextResponse } from 'next/server'
import getPayload from '@/lib/payload'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')
  if (token !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const eventData = await req.json()
  const { type, data } = eventData
  const user = data.object

  if (type !== 'user.created') {
    return new Response(JSON.stringify({ error: 'Invalid event type' }), { status: 400 })
  }
  const { user_id, email, name } = user

  const payload = await getPayload()
  try {
    await payload.create({
      collection: 'profiles',
      data: {
        email: email,
        name: name,
        id: user_id,
      },
    })
    return NextResponse.json({ message: 'Profile created' }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create profile',
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    )
  }
}
