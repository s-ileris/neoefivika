'use client'
import { useEffect, useRef } from 'react'
import ArticlesView from './articlesView'
import useSWRInfinite from 'swr/infinite'
const select =
  '&select[title]=true&select[slug]=true&select[type]=true&select[image]=true&select[createdAt]=true&select[author]=true'
const PAGE_SIZE = 20

const fetcher = (url: string) =>
  fetch(url, { next: { revalidate: 86400, tags: ['a'] } }).then((res) => res.json())

export default function Articles() {
  const endRef = useRef<HTMLDivElement | null>(null)
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.docs.length) return null

    return `/api/article?limit=${PAGE_SIZE}&page=${pageIndex + 1}${select}`
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
