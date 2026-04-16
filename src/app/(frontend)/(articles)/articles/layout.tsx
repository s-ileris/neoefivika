'use client'
import Menu from '@/components/menu'
import { articleTypes } from '@/lib/article'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'

function ArticlesTypeLinks() {
  const pathname = usePathname().split('/').pop()
  return (
    <div className="flex overflow-x-auto  space-x-3 py-2 px-1 scrollbar-thin scrollbar-thumb-[#4E148C]/30 scrollbar-track-[#F5F4F8]">
      <Link
        replace
        className="text-xl max-sm:text-base font-medium decoration-dotted underline"
        style={{ color: pathname === 'articles' ? '#4E148C' : 'black' }}
        href={'/articles'}
      >
        Όλα
      </Link>

      {articleTypes.map((article) => (
        <Link
          replace
          className="text-xl max-sm:text-base font-medium decoration-dotted underline"
          href={'/articles/' + article.value}
          style={{ color: pathname === article.value ? '#4E148C' : 'black' }}
          key={article.value}
        >
          {article.label}
        </Link>
      ))}
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Menu />
      <div className="pt-24 px-5">
        <Suspense
          fallback={
            <div className="flex overflow-x-auto space-x-3 py-2 px-1 scrollbar-thin scrollbar-thumb-[#4E148C]/30 scrollbar-track-[#F5F4F8]">
              <span className="text-xl max-sm:text-base font-medium text-black">Όλα</span>
              {articleTypes.map((article) => (
                <span
                  className="text-xl max-sm:text-base font-medium text-black"
                  key={article.value}
                >
                  {article.label}
                </span>
              ))}
            </div>
          }
        >
          <ArticlesTypeLinks />
        </Suspense>
        <h1 className="text-7xl max-sm:text-4xl font-bold tracking-tight">Κείμενα</h1>
      </div>
      <Suspense>{children}</Suspense>
    </div>
  )
}
