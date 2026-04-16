import Client from './page.client'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import getPayload from '@/lib/payload'

export default async function Page() {
  return (
    <div className="min-h-screen">
      <Suspense fallback="">
        <Cached />
      </Suspense>
    </div>
  )
}

async function Cached() {
  const payload = await getPayload()
  const news = await payload.find({
    limit: 20,
    collection: 'article',
    where: {
      'application.status': {
        equals: 'published',
      },
    },
    select: {
      title: true,
      slug: true,
      type: true,
      image: true,
      createdAt: true,
      author: true,
    },
  })
  if (!news.docs.length) {
    return notFound()
  }
  //@ts-expect-error
  return <Client initialData={news.docs} totalPages={news.totalPages} />
}
