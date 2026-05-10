import getPayload from '@/lib/payload'
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { isAuthenticated } = await auth()

  // Protect the route by checking if the user is signed in
  if (!isAuthenticated) {
    return NextResponse.json(
      {
        error: 'Παρακαλούμε συνδεθείτε',
      },
      { status: 403 },
    )
  }
  const user = await currentUser()
  if (!user) {
    return NextResponse.json(
      {
        error: 'Παρακαλούμε συνδεθείτε',
      },
      { status: 403 },
    )
  }
  const userId = user.id

  const { name, birthday } = await req.json()
  const client = await clerkClient()
  if (!name || !birthday)
    return NextResponse.json(
      { error: 'Παρακαλούμε συμπληρώστε το όνομα και τα γεννέθλιά σας.' },
      { status: 400 },
    )
  const payload = await getPayload()
  try {
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    })
    await payload.update({
      collection: 'profiles',
      id: userId,
      data: {
        name: name,
        birthday: birthday,
      },
    })
    return NextResponse.json('ok')
  } catch (err) {
    return NextResponse.json(
      { error: 'Δεν μπορέσαμε να εφαρμόσουμε τις αλλαγές.' },
      { status: 200 },
    )
  }
}
