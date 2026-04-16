import type { Access } from 'payload'

import { checkRole } from './checkRole'

export const adminsAndAuthor: Access = ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(['admin'], user)) {
    return true
  }
  if (checkRole(['author'], user)) {
    return {
      id: { equals: user.id },
    }
  }
  return false
}
