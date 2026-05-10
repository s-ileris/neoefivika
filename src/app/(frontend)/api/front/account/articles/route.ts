import getAuth from '@/lib/getAuth'
import getPayload from '@/lib/payload'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const pageParam = req.nextUrl.searchParams.get('page')
  const page = pageParam ? parseInt(pageParam, 10) : 1
  const { isAuthenticated } = await auth()
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
  const articles = await payload.find({
    collection: 'article',
    where: {
      author: { equals: uid },
    },
    select: {
      application: true,
      title: true,
      type: true,
      createdAt: true,
      slug: true,
      image: true,
    },
    limit: 10,
    page,
  })

  return NextResponse.json(articles)
}

export async function DELETE(req: NextRequest) {
  const uid = await getAuth()
  if (!uid) {
    return NextResponse.json(
      {
        title: 'Παρακαλούμε συνδεθείτε',
      },
      { status: 403 },
    )
  }
  const body = await req.json()
  const { id } = body

  if (!id) {
    return NextResponse.json({ error: 'Λείπει το id του άρθρου.' }, { status: 400 })
  }
  const payload = await getPayload()

  try {
    const articleRes = await payload.findByID({
      collection: 'article',
      id,
      depth: 0,
      select: {
        author: true,
        image: true,
      },
    })

    if (!articleRes) {
      return NextResponse.json({ error: 'Το άρθρο δεν βρέθηκε.' }, { status: 404 })
    }

    if (!articleRes.author || articleRes.author !== uid) {
      return NextResponse.json(
        { error: 'Δεν έχετε δικαίωμα διαγραφής αυτού του άρθρου.' },
        { status: 403 },
      )
    }

    await payload.delete({
      collection: 'article',
      id,
    })

    if (articleRes.image) {
      try {
        await payload.delete({
          collection: 'media', // or the collection name you use for your images
          id: typeof articleRes.image === 'object' ? articleRes.image.id : articleRes.image,
        })
      } catch (e) {}
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { error: error?.message || 'Σφάλμα κατά τη διαγραφή άρθρου.' },
      { status: 500 },
    )
  }
}
