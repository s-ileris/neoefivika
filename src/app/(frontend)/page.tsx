import { Suspense } from 'react'

import FeaturedArticles, { ArticlesSkeleton } from '@/components/home/featured'
import HeroSection from '@/components/home/hero'

export default function Page() {
  return (
    <main>
      <HeroSection />

      <Suspense fallback={<ArticlesSkeleton />}>
        <FeaturedArticles />
      </Suspense>
    </main>
  )
}
