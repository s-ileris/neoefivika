import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function Page() {
  return (
    <div className="fixed top-0 w-full h-dvh left-0 z-10 bg-white grid place-items-center p-5">
      <Suspense>
        <SignIn signUpUrl="/signup" />
      </Suspense>
    </div>
  )
}
