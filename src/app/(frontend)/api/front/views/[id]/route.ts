import { NextRequest, NextResponse } from 'next/server'
import { getArticleViewCount } from '@/lib/viewsService'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/front/views/[id]'>) {
  try {
    const { id } = await ctx.params

    if (!id) {
      return NextResponse.json({ error: 'articleId is required' }, { status: 400 })
    }

    const result = await getArticleViewCount(id)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (err) {
    console.error('[GET /api/views/[articleId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
