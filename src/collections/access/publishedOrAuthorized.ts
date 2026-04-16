import type { Access } from 'payload'

import { checkRole } from './checkRole'
import { Article } from '@/payload-types'

export const publishedOrAuthorized: Access<Article> = ({ req: { user } }) => {
  if (checkRole(['admin', 'author'], user)) {
    return true
  }
  return {
    'application.status': {
      equals: 'published',
    },
  }
}
