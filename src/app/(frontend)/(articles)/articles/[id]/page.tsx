import { Suspense } from 'react'
import Articles from './page.client' // This is your Client Component
import { Article } from '@/payload-types'

// 1. Define the Page (Server Component)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense fallback={<p>Loading articles...</p>}>
      <ArticlesFetcher id={id} />
    </Suspense>
  )
}

async function ArticlesFetcher({ id }: { id: string }) {
  // Replace this with your actual Payload CMS fetch logic
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/article?where[type][equals]=${id}&limit=20`,
    {
      next: { revalidate: 3600 }, // Cache for an hour
    },
  )

  const data = await res.json()

  return <Articles initialData={data.docs as Article[]} totalPages={data.totalPages} id={id} />
}
