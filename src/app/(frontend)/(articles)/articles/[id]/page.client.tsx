'use client'
import { stringify } from 'qs-esm'
import { useEffect, useRef } from 'react'
import ArticlesView from '../articlesView'
import useSWRInfinite from 'swr/infinite'
const PAGE_SIZE = 20

export default function Page({ id }: { id: string }) {
  const fetcher = (url: string) =>
    fetch(url, { next: { revalidate: 86400, tags: [`a-${id}`] } }).then((res) => res.json())

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
  const endRef = useRef<HTMLDivElement | null>(null)
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.docs.length) return null
    return `/api/article${stringifiedQuery}&limit=${PAGE_SIZE}&page=${pageIndex + 1}`
  }

  const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    persistSize: true,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
  })

  const articles = data ? data.flatMap((page) => page.docs) : []
  const isReachingEnd = data && data[data.length - 1]?.docs.length < PAGE_SIZE

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating && !isReachingEnd) {
          setSize(size + 1)
        }
      },
      { threshold: 0.1 },
    )

    if (endRef.current) observer.observe(endRef.current)
    return () => observer.disconnect()
  }, [isValidating, isReachingEnd, size, setSize])

  return (
    <>
      <ArticlesView data={articles} />

      {(isLoading || (isValidating && size > 1)) && (
        <div className="fixed inset-0 bg-white/50 grid place-items-center w-full h-screen z-10">
          <p className="animate-pulse font-medium">Φόρτωση κειμένων...</p>
        </div>
      )}

      <div ref={endRef} className="h-10" />
    </>
  )
}
