'use client'
import { useEffect, useRef, useCallback } from 'react'
import { Article } from '@/payload-types'
import ArticlesView from '../articlesView'
import { useState } from 'react'
import { stringify } from 'qs-esm'

export default function Articles({
  initialData,
  totalPages,
  id,
}: {
  initialData: Article[]
  totalPages: number
  id: string
}) {
  const stringifiedQuery = stringify(
    {
      where: {
        type: {
          equals: id,
        },
      },
      select: {
        title: true,
        slug: true,
        image: true,
        type: true,
        updatedAt: true,
        author: true,
      },
    },
    { addQueryPrefix: true },
  )
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Article[]>(initialData || [])
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || totalPages === page) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await fetch(`/api/article${stringifiedQuery}&limit=20&page=${nextPage}`)
      if (!res.ok) throw new Error('Something went wrong')
      const json = await res.json()
      if (Array.isArray(json.docs)) {
        setData((prev) => [...prev, ...json.docs])
        setPage(nextPage)
      }
    } catch (e: any) {
      console.error('ERROR FETCHING ARTICLES', e)
    } finally {
      setLoading(false)
    }
  }, [page, loading])

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        loadMore()
        observer.unobserve(entry.target) // Stop observing after first intersect
      }
    },
    [loadMore],
  )

  useEffect(() => {
    const target = endRef.current
    if (!target) return

    const observer = new IntersectionObserver((entries, obs) => handleObserver(entries, obs), {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    })

    observer.observe(target)
    return () => {
      observer.disconnect()
    }
  }, [handleObserver])

  return (
    <>
      <ArticlesView data={data} />
      {loading && (
        <div className="fixed inset-0 bg-white/50 gris place-items-center w-full h-screen z-10">
          <p>loading more.. .</p>
        </div>
      )}
      <div ref={endRef} />
    </>
  )
}
