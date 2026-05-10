'use client'

import { useEffect, useRef } from 'react'

export function useArticleView(articleId: number) {
  const hasStartedTimer = useRef(false)

  useEffect(() => {
    if (hasStartedTimer.current) return
    if (!articleId) return
    const VIEW_THRESHOLD_MS = 10000

    const timer = setTimeout(async () => {
      try {
        await fetch('/api/front/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ article_id: articleId.toString() }),
        })
      } catch (error) {
        console.error('[View log]: Could not log an article view')
      }
    }, VIEW_THRESHOLD_MS)

    hasStartedTimer.current = true

    return () => {
      clearTimeout(timer)
      hasStartedTimer.current = false
    }
  }, [articleId])
}
