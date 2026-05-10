import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')
  if (token !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const data = await req.json()
    const { tags } = data
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag, 'max')
      }
    }
    return NextResponse.json({ message: 'Tags revalidated.' })
  } catch (e) {
    console.error('Tag revalidation failed:', e)
    return NextResponse.json({ message: 'Revalidation failed' }, { status: 500 })
  }
}
