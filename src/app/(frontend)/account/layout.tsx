import Menu from '@/components/menu'
import { Suspense } from 'react'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <Menu />
      {children}
    </Suspense>
  )
}
