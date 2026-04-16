// src/lib/viewsService.js
import { db, FieldValue } from '@/lib/firebase'

const COUNTERS_COLLECTION = 'articles'

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getWeeklyCutoff() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
}

function computeWeeklyTotal(days = {}) {
  const cutoff = getWeeklyCutoff()
  return Object.entries(days)
    .filter(([dateStr]) => new Date(dateStr) >= cutoff)
    .reduce((sum, [, count]) => sum + count, 0)
}

export async function incrementView(articleId: string) {
  const today = getTodayKey()
  const counterRef = db.collection(COUNTERS_COLLECTION).doc(articleId)

  await counterRef.set(
    {
      days: { [today]: FieldValue.increment(1) },
      total: FieldValue.increment(1), // ← add this
    },
    { merge: true },
  )
}
export async function getArticleViewCount(articleId: string) {
  const doc = await db.collection(COUNTERS_COLLECTION).doc(articleId).get()
  if (!doc.exists) return { articleId, weekly: 0, total: 0, days: {} }

  const { days = {}, total = 0 } = doc.data()

  return {
    articleId,
    weekly: computeWeeklyTotal(days),
    total, // ← add this
    days,
  }
}

export async function getMostViewed({ limit = 10 } = {}) {
  const snapshot = await db.collection(COUNTERS_COLLECTION).get()
  return snapshot.docs
    .map((doc) => ({
      article_id: doc.id,
      weekly: computeWeeklyTotal(doc.data().days || {}),
    }))
    .filter((a) => a.weekly > 0)
    .sort((a, b) => b.weekly - a.weekly)
    .slice(0, limit)
}

export async function pruneOldBuckets() {
  const cutoff = getWeeklyCutoff().toISOString().split('T')[0]
  const snapshot = await db.collection(COUNTERS_COLLECTION).get()
  if (snapshot.empty) return { pruned: 0 }

  const batch = db.batch()
  let pruned = 0

  snapshot.forEach((doc) => {
    const days = doc.data().days || {}
    const staleKeys = Object.keys(days).filter((d) => d < cutoff)
    if (staleKeys.length > 0) {
      const update = Object.fromEntries(staleKeys.map((d) => [`days.${d}`, FieldValue.delete()]))
      batch.update(doc.ref, update)
      pruned += staleKeys.length
    }
  })

  await batch.commit()
  return { pruned }
}
