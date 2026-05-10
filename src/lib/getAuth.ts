import { auth, currentUser } from '@clerk/nextjs/server'
export default async function getAuth() {
  const { isAuthenticated } = await auth()
  if (!isAuthenticated) return false
  const user = await currentUser()
  if (!user) return false
  return user.id
}
