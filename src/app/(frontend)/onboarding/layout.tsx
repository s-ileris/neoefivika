'use client'
import Logo from '@/components/logo'
import { Suspense } from 'react'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="text-white grid place-items-center fixed top-0 left-0 bg-[#4E148C] min-h-screen max-sm:px-3 px-10">
      <div className="fixed top-0 left-0 w-full py-7 px-10 z-10">
        <Logo size={48} className="" />
      </div>

      <div
        className={`fixed inset-0  z-0 transition-opacity duration-700 `}
        style={{ contain: 'strict' }}
      >
        <iframe src="https://bg.neoefivika.gr" className="h-full w-full" />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <Suspense>{children}</Suspense>
    </div>
  )
}
