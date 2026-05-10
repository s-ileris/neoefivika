import getPayload from '@/lib/payload'
import { Profile } from '@/payload-types'
import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

async function getUID(): Promise<string | null> {
  const user = await currentUser()
  if (!user || !user.id) return null
  const id = user.id ?? null
  return id
}

async function getProfile(id: string, select?: { [key: string]: boolean }) {
  const payload = await getPayload()
  const user = await payload.findByID({
    collection: 'profiles',
    id,
    ...(select ? select : null),
  })
  return user
}

async function updateProfile(userId: string, data: Partial<Profile>) {
  const payload = await getPayload()
  await payload.update({
    collection: 'profiles',
    id: userId,
    data: data,
  })
  return { id: userId, ...data }
}

export async function GET() {
  try {
    const id = await getUID()
    if (!id) {
      return NextResponse.json({ error: 'Παρακαλούμε συνδεθείτε ξανά.' }, { status: 401 })
    }

    const profile = await getProfile(id)
    return NextResponse.json(profile)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  let userId: string | null = null
  try {
    userId = await getUID()
    if (!userId) {
      return NextResponse.json({ error: 'Παρακαλούμε συνδεθείτε ξανά.' }, { status: 401 })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Παρακαλούμε συνδεθείτε ξανά.' }, { status: 500 })
  }

  let body: Record<string, any> = {}
  try {
    const formData = await req.formData()
    const allowedFields = ['name', 'bio', 'links', 'location', 'birthday']

    for (const field of allowedFields) {
      if (formData.has(field)) {
        let val = formData.get(field)
        if (field === 'links' && typeof val === 'string') {
          try {
            val = JSON.parse(val)
          } catch (e) {
            return NextResponse.json({ error: 'Άγνωστο σφάλμα στο πεδίο links.' }, { status: 400 })
          }
        }
        body[field] = val
      }
    }

    if (body.location !== undefined && body.location !== null && body.location !== '') {
      const locationVal = parseInt(body.location)
      if (
        !(
          typeof locationVal === 'number' &&
          Number.isInteger(locationVal) &&
          locationVal >= 1 &&
          locationVal <= 143
        )
      ) {
        return NextResponse.json({ error: 'Η τοποθεσία δεν υποστηρίζεται.' }, { status: 400 })
      }
      body.location = locationVal
    }
  } catch (e) {
    return NextResponse.json({ error: 'Άγνωστο σφάλμα προέκυψε.' }, { status: 400 })
  }

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'Δεν υπάρχει κάτι για αλλαγή.' }, { status: 400 })
  }

  try {
    const updated = await updateProfile(userId, body)
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err && typeof err === 'object' && err.message) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Άγνωστο σφάλμα προέκυψε.' }, { status: 500 })
  }
}
