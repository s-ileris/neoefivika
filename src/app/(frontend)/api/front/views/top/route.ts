import { NextResponse } from 'next/server'
import { getMostViewed } from '@/lib/viewsService'
import redis from '@/lib/redis'
import getPayload from '@/lib/payload'

export async function GET() {
  try {
    await redis.connect()
    const cached = await redis.get('top')
    if (cached) {
      const parsed = JSON.parse(cached)
      await redis.quit()
      return NextResponse.json(
        { data: parsed.data, generatedAt: parsed.generatedAt },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        },
      )
    }
    const mostViewed = await getMostViewed({ limit: 5 })
    const data = await populateArticles(mostViewed)

    await redis.set('top', JSON.stringify({ data: data, generatedAt: new Date().toISOString() }))
    await redis.quit()

    return NextResponse.json(
      { data: data, generatedAt: new Date().toISOString() },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    )
  } catch (err) {
    try {
      await redis.quit()
    } catch {}
    console.error('[GET /api/views/most-viewed]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function populateArticles(
  articles: {
    article_id: string
    weekly: number
  }[],
) {
  const payload = await getPayload()

  const final = await Promise.all(
    articles.map(async (i) => {
      const articleData = await payload.findByID({
        collection: 'article',
        id: i.article_id,
        select: {
          title: true,
          type: true,
          slug: true,
          createdAt: true,
          author: true,
          image: true,
        },
      })
      let image = articleData.image
      if (image && typeof image === 'object') {
        const newImage: any = {}
        if (image.sizes && image.sizes.small && image.sizes.small.url) {
          newImage.url = image.sizes.small.url
        } else {
          newImage.url = image.url
        }
        newImage.lqip = image.lqip
        image = newImage
      }
      const article = { ...articleData, image, weekly_views: i.weekly }
      return article
    }),
  )

  return final
}
