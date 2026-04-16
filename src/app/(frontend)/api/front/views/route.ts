import { NextRequest, NextResponse } from 'next/server'
import { incrementView } from '@/lib/viewsService'

const DEDUP_WINDOW_HOURS = 24

export async function POST(req: NextRequest) {
  try {
    const { article_id } = await req.json()

    if (!article_id) {
      return NextResponse.json({ error: 'article_id is required' }, { status: 400 })
    }

    const cookieKey = `viewed_${article_id}`
    const alreadyViewed = req.cookies.get(cookieKey)

    if (alreadyViewed) {
      return NextResponse.json({ counted: false, reason: 'duplicate' })
    }

    await incrementView(article_id)

    const res = NextResponse.json({ counted: true })

    // Set cookie for 24h so same browser won't count again
    res.cookies.set(cookieKey, '1', {
      httpOnly: true,
      maxAge: 60 * 60 * DEDUP_WINDOW_HOURS,
      path: '/',
      sameSite: 'strict',
    })

    return res
  } catch (err) {
    console.error('[POST /api/views]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
