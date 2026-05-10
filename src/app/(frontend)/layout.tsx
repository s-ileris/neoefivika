import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import localFont from 'next/font/local'
import Footer from '@/components/footer'
import { Suspense } from 'react'
import { elGR } from '@clerk/localizations'
import Menu from '@/components/menu'

const myFont = localFont({
  src: './fonts/ABCMonumentGrotesk.woff2',
})

export const metadata: Metadata = {
  title: 'Νέοεφηβικά',
  description:
    'Η πρώτη ελληνική κοινότητα νέων ηλικίας 13 με 23. Απλώς χρησιμοποίησε την φωνή σου.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${myFont.className} antialiased`}>
        <ClerkProvider localization={elGR} signInUrl="/login" signUpUrl="/signup">
          <Menu />
          {children}
        </ClerkProvider>
        <Suspense>
          <Footer />
        </Suspense>
      </body>
    </html>
  )
}
