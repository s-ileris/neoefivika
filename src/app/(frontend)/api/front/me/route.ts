import getAuth from '@/lib/getAuth'
import getPayload from '@/lib/payload'
import { NextResponse } from 'next/server'

export async function GET() {
  const uid = await getAuth()
  if (!uid) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      { status: 403 },
    )
  }
  const payload = await getPayload()
  const profile = await payload.findByID({
    collection: 'profiles',
    id: uid,
    select: {
      location: false,
      links: false,
    },
  })
  return NextResponse.json(profile)
}
