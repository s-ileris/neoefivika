import { notFound, redirect } from 'next/navigation'
import Client from './page.client'
import { Suspense } from 'react'
import { Metadata } from 'next'
import Logo from '@/components/logo'
import getPayload from '@/lib/payload'
import Link from 'next/link'
import Search from '@/components/icons/search'
import ArrowLeft from '@/components/icons/arrowLeft'
import { cacheLife, cacheTag } from 'next/cache'

export const getArticle = async (slug: string) => {
  'use cache'
  cacheTag(`a:${slug}`)
  cacheLife('max')
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'article',
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await getPayload()
  const articles = await payload.find({
    collection: 'article',
    select: {
      slug: true,
    },
    limit: 0,
  })
  if (!articles.docs || articles.docs.length === 0) {
    return [{ slug: 'none' }]
  }
  return articles.docs.map((post) => ({
    slug: String(post.slug),
  }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="min-h-[150vh] pb-10">
      <div className="fixed px-5 py-4 z-60 top-0 left-0 bg-transparent w-full h-fit flex items-center">
        <Link href={'/articles/'} className="flex-1 flex items-center">
          <ArrowLeft size={26} />
        </Link>
        <Link href={'/'} className="flex-1 flex justify-center">
          <Logo color="#4E148C" size={32} />
        </Link>
        <div className="flex-1 flex justify-end items-center space-x-3">
          <Search size={26} />
        </div>
      </div>
      <Suspense>
        <CachedComponent slug={slug} />
      </Suspense>
    </div>
  )
}

async function CachedComponent({ slug }: { slug: string }) {
  const payload = await getPayload()
  const result = await getArticle(slug)
  if (!result) {
    return notFound()
  }
  if (result.application?.status === 'pending') {
    redirect('/article/pending')
  } else if (result.application?.status === 'rejected') {
    redirect('/article/rejected')
  } else {
    return <Client data={result} />
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) {
    return {}
  }
  if (article.image) {
    if (typeof article.image === 'number' || !article.image.url) {
      return {
        title: article.title + ' - Νέοεφηβικά',
        description: article.description,
      }
    }
    return {
      title: article.title + ' - Νέοεφηβικά',
      description: article.description,
      openGraph: {
        images: [article.image.url],
      },
    }
  }
  return {
    title: article.title + ' - Νέοεφηβικά',
    description: article.description,
  }
}
