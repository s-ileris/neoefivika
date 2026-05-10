import { Suspense } from 'react'

import HeroSection from '@/components/home/hero'
import dynamic from 'next/dynamic'
const FeaturedArticles = dynamic(() => import('@/components/home/featured'))

export default function Page() {
  return (
    <main>
      <HeroSection />
      <div className="h-screen" />
      <div className="bg-white">
        <Suspense>
          <FeaturedArticles />
        </Suspense>
      </div>
    </main>
  )
}
