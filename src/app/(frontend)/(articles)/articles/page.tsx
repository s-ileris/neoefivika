import Client from './page.client'
import { Suspense } from 'react'

export default async function Page() {
  return (
    <div className="min-h-screen">
      <Suspense>
        <Client />
      </Suspense>
    </div>
  )
}
