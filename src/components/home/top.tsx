'use client'

import { Article } from '@/payload-types'
import { useEffect, useState } from 'react'

export default function TopArticles() {
  const [data, setData] = useState<Article[] | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    fetch('/api/front/views/top')
      .then((res) => res.json())
      .then((result) => {
        setData(result)
      })
      .catch((err) => {})
      .finally(() => setLoading(false))
  }, [])
  return (
    <div className="h-screen">
      {loading && 'loading'}
      {JSON.stringify(data)}
    </div>
  )
}
