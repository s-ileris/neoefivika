import { auth0 } from '@/lib/auth0'
import getPayload from '@/lib/payload'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Header from './header'
import MyArticles from './myArticles'

export default async function AccountPage() {
  const session = await auth0.getSession()
  if (!session) redirect('/auth/login')
  const payload = await getPayload()
  const profile = await payload
    .findByID({
      collection: 'profiles',
      id: session.user.sub,
    })
    .catch((e: Error) => {
      console.error(e)
      redirect('/account/error')
    })
  return (
    <div className="py-16">
      <Header profile={profile} />
      <Suspense>
        <MyArticles />
      </Suspense>
    </div>
  )
}
