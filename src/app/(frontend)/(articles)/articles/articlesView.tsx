'use client'
import PImage from '@/components/PayloadImage'
import { getArticleLabel, getAuthor } from '@/lib/article'
import { isValidImage } from '@/lib/utils'
import { Article } from '@/payload-types'
import Link from 'next/link'

export default function ArticlesView({ data }: { data: Article[] }) {
  return (
    <main>
      <div className="mt-12 px-5 grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 max-lg:gap-4 gap-8">
        {data.map((article) => (
          <Link
            href={'/article/' + article.slug}
            key={article.id}
            className={'group relative flex flex-col ' + (!article.image && 'p-3')}
          >
            {isValidImage(article.image) ? (
              <div className="relative">
                <PImage
                  unoptimized
                  //@ts-ignore
                  image={article.image}
                  alt={article.title}
                  size="small"
                  width={800}
                  height={800}
                  className="object-cover aspect-square"
                />
                <p className="bg-white px-2 py-1 text-sm font-medium absolute bottom-2 left-2">
                  {getArticleLabel(article.type)}
                </p>
              </div>
            ) : (
              <>
                <p className="bg-white px-2 py-1 text-sm font-medium w-fit mb-3 border border-black/10">
                  {getArticleLabel(article.type)}
                </p>
                <div className="absolute inset-0 bg-[#F5F4F8] -z-10"></div>
              </>
            )}
            <div className={article.image ? 'mt-3' : 'mt-auto'}>
              <h1
                className={
                  (article.image ? 'text-2xl' : 'text-3xl') +
                  ' group-hover:text-[#4E148C] font-[450] text-pretty leading-[1.2] transition-colors trakcing-tight'
                }
              >
                {article.title}
              </h1>
              {article.author && (
                <p className="text-sm text-gray-500 mt-1.5">
                  {getAuthor(article.author, article.createdAt)?.name}
                  {getAuthor(article.author, article.createdAt)?.age
                    ? `, ${getAuthor(article.author, article.createdAt)?.age} ετών`
                    : ''}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
