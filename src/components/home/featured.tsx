// components/FeaturedArticles.tsx
import { getCachedHomepage } from './data'

export default async function FeaturedArticles() {
  const data = await getCachedHomepage()
  const articles = data.featured || []

  if (articles.length === 0) return null

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article key={article.id} className="border p-4 rounded-lg">
            {/* If article is a relationship, access fields accordingly */}
            <h3 className="font-semibold">{article.article.title}</h3>
            <p className="text-sm text-gray-600">{article.article.type}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

// Simple Loading UI for the stream
export function ArticlesSkeleton() {
  return (
    <div className="animate-pulse py-12">
      <div className="h-8 w-48 bg-gray-200 mb-6 rounded" />
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
