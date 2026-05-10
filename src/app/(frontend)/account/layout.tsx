import { Suspense } from 'react'
import Toaster from './toater'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Suspense>{children}</Suspense>
      <Toaster />
    </div>
  )
}
