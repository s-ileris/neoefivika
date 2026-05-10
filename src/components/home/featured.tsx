import { isValidImage } from '@/lib/utils'
import PImage from '../PayloadImage'
import { getCachedHomepage } from './data'
import { getArticleLabel, getAuthor } from '@/lib/article'
import Link from 'next/link'

export default async function FeaturedArticles() {
  const data = await getCachedHomepage()
  const articles = data.featured || []
  if (articles.length === 0) return null
  
  return (
    <section>
      <div className="">
        {articles.map((article, idx) => {
          if (typeof article.article !== 'object' || !article.article) return
          const a = article.article
          return (
            <Link
              href={'/article/' + a.slug}
              key={article.id}
              className={`flex ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} ${!isValidImage(a.image) && 'p-5 bg-grey'} max-md:flex-col min-h-[50vh] w-full md:gap-10`}
            >
              {isValidImage(a.image) && (
                <PImage
                  //@ts-ignore
                  image={a.image}
                  alt={a.title + 'Cover Image'}
                  unoptimized
                  size="small"
                  className="object-cover w-full h-full max-md:max-w-full"
                />
              )}
              <div
                className={`${idx % 2 === 0 ? 'md:pr-5' : 'md:pl-5'} ${!isValidImage(a.image) ? 'max-w-full text-center w-full' : 'max-w-1/2'} md:py-5 max-md:p-5 flex flex-col  w-fit max-md:max-w-full!`}
              >
                <p className="mb-2">{getArticleLabel(a.type)}</p>
                <h3 className="font-semibold text-5xl max-sm:text-3xl max-lg:text-4xl">{a.title}</h3>
                {typeof a.author === 'object' ? (
                  <p className="mt-auto max-sm:mt-4 max-sm:text-sm">
                    {a.author?.name}, {getAuthor(a.author, a.createdAt)?.age} ετών
                  </p>
                ) : (
                  <p className="mt-auto max-sm:mt-4 max-sm:text-sm">Ανώνυμο</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

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
