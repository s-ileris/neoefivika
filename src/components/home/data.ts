import getPayload from '@/lib/payload'
import { cacheTag } from 'next/cache'

export async function getCachedHomepage() {
  'use cache'
  cacheTag('homepage')
  const payload = await getPayload()
  return await payload.findGlobal({
    slug: 'homepage',
    depth: 2,
    select: {
      featured: true,
    },
  })
}
