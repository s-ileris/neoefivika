import getAuth from '@/lib/getAuth'
import getPayload from '@/lib/payload'
import { currentUser, auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { v1 } from 'uuid'

export async function DELETE() {
  const { isAuthenticated } = await auth()

  // Protect the route by checking if the user is signed in
  if (!isAuthenticated) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const user = await currentUser()
  if (!user) {
    return NextResponse.json(
      {
        title: 'Παρακαλούμε συνδεθείτε',
      },
      { status: 403 },
    )
  }
  const uid = user.id
  const payload = await getPayload()
  try {
    const profile = await payload.findByID({
      collection: 'profiles',
      id: uid,
      select: {
        profile: true,
      },
      depth: 0,
    })

    if (typeof profile.profile !== 'number') {
      return NextResponse.json({
        title: 'Δεν βρέθηκε εικόνα προφίλ',
        message: 'Δοκιμάστε να επαναφορτώσετε την σελίδα.',
      })
    }

    await payload.delete({
      collection: 'user-media',
      id: profile.profile,
    })
    return NextResponse.json({ message: 'Deleted.' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Could not fetch new profile picture.' }, { status: 500 })
  }
}

export async function GET() {
  const { isAuthenticated } = await auth()

  // Protect the route by checking if the user is signed in
  if (!isAuthenticated) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const user = await currentUser()
  if (!user) {
    return NextResponse.json(
      {
        title: 'Παρακαλούμε συνδεθείτε',
      },
      { status: 403 },
    )
  }
  const uid = user.id
  const payload = await getPayload()
  try {
    const profile = await payload.findByID({
      collection: 'profiles',
      id: uid,
      select: {
        profile: true,
      },
    })
    return NextResponse.json(profile)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Could not fetch new profile picture.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const uid = await getAuth()

  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await req.json()
  if (!id) {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 })
  }
  const payload = await getPayload()
  try {
    const avatarData = await payload.findByID({
      collection: 'profiles',
      id: uid,
      select: {
        profile: true,
      },
      depth: 0,
    })

    if (typeof avatarData.profile === 'number') {
      await payload.delete({
        collection: 'user-media',
        id: avatarData.profile,
      })
    }

    const data = await payload.update({
      collection: 'profiles',
      id: uid,
      data: {
        profile: id,
      },
      select: {
        profile: true,
      },
    })
    return NextResponse.json({ profile: data.profile })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Profile could not be updated' }, { status: 500 })
  }
}
