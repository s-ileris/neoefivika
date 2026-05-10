'use client'

import { redirect } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Header from './header'
import MyArticles from './myArticles'
import Logout from './logout'
import { Profile } from '@/payload-types'
import { WarningIcon } from '@phosphor-icons/react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<null | Profile>()
  useEffect(() => {
    setError('')
    fetch('/api/front/me')
      .then(async (res) => {
        if (!res.ok) {
          console.error('Could not get profile')
          setError('Δεν μπορέσαμε να βρούμε το προφίλ σας.')
          setLoading(false)
        }
        const data = await res.json()
        if (!data) {
          redirect('/account/wait')
        }
        setProfile(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Δεν μπορέσαμε να βρούμε το προφίλ σας.')
        setLoading(false)
      })
  }, [])
  if (error && !loading) {
    return (
      <div className="h-screen w-full grid place-items-center p-5">
        <div className="bg-[#F00] px-6 py-4 text-white font-medium flex items-center ">
          <WarningIcon size={28} />
          <p className="ml-4">
            {'Σφάλμα: '}
            {error}
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="py-16 min-h-screen">
      {!profile && loading ? (
        <Skeleton className="flex max-sm:flex-col max-sm:pb-14 items-center relative sm:bg-[#D1D5DB50] gap-20 max-sm:gap-8">
          <Skeleton className="w-1/3 bg-[#D1D5DB] max-sm:w-5/6 max-sm:mr-auto aspect-square shrink-0 relative"></Skeleton>
        </Skeleton>
      ) : (
        //@ts-ignore
        <Header profile={profile} />
      )}
      <Suspense>
        <MyArticles />
      </Suspense>
      <Suspense>
        <section className="max-w-6xl flex space-x-5 mx-auto px-5 mt-10">
          <Logout />
        </section>
      </Suspense>
    </div>
  )
}
