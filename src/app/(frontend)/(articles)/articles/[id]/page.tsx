import Client from './page.client'
import { Suspense } from 'react'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="min-h-screen">
      <Suspense>
        <Client id={id} />
      </Suspense>
    </div>
  )
}
