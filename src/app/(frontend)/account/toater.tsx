'use client'
import { WarningIcon } from '@phosphor-icons/react'
import { Suspense } from 'react'
import { Toaster as _Toaster } from 'sonner'
export default function Toaster() {
  return (
    <Suspense>
      <_Toaster
        toastOptions={{
          className: '!rounded-none !border !border-black/10',
        }}
        icons={{
          error: <WarningIcon size={16} />,
        }}
      />
    </Suspense>
  )
}
