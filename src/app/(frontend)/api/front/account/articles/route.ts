import { auth0 } from '@/lib/auth0'
import getPayload from '@/lib/payload'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const pageParam = req.nextUrl.searchParams.get('page')
  const page = pageParam ? parseInt(pageParam, 10) : 1
  const session = await auth0.getSession()
  if (!session) {
    return NextResponse.json(
      {
        title: 'Παρακαλούμε συνδεθείτε',
      },
      { status: 403 },
    )
  }
  const uid = session.user.sub
  const payload = await getPayload()
  const articles = await payload.find({
    collection: 'article',
    where: {
      author: { equals: uid },
    },
    select: {
      application: true,
      title: true,
      createdAt: true,
      slug: true,
    },
    limit: 10,
    page,
  })
  
  return NextResponse.json(articles)
}
