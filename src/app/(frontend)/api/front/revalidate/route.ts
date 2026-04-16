import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')
  if (token !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const data = await req.json()
    const { slug, collection } = data
    if (collection === 'article') {
      revalidatePath(`/article/${slug}`, 'page')
      return NextResponse.json({ message: 'Path revalidated.' })
    }
    return NextResponse.json({ message: 'Invalid collection.' })
  } catch (e) {
    console.error('Path revalidation failed:', e)
    return NextResponse.json({ message: 'Revalidation failed' }, { status: 500 })
  }
}
