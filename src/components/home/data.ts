import getPayload from '@/lib/payload'
import { unstable_cache } from 'next/cache'

export const getCachedHomepage = unstable_cache(
  async () => {
    const payload = await getPayload()
    return await payload.findGlobal({
      slug: 'homepage',
      depth: 2,
    })
  },
  ['homepage-global'],
  {
    tags: ['homepage'],
    revalidate: 86400,
  },
)

