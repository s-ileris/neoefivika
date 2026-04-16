'use client'

import { useEffect } from 'react'

export function useArticleView(articleId: number) {
  useEffect(() => {
    if (!articleId) return

    fetch('/api/front/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: articleId.toString() }),
    }).catch(() => {
      console.error('[View log]: Could not log an article view')
    })
  }, [articleId])
}
