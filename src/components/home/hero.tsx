'use client'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <>
      <main
        suppressHydrationWarning
        className="fixed -z-10 top-0 left-0 w-full bg-[#4E148C] overflow-hidden"
      >
        <div className={`fixed h-[120vh] w-full top-0 left-0 z-10`} style={{ contain: 'strict' }}>
          <iframe src="https://bg.neoefivika.gr" className="h-full w-full" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="absolute z-20 bottom-0 left-0 w-full p-5">
          <Image
            loading="eager"
            alt="Νέοεφηβικά"
            width={2000}
            height={358}
            src={'/cover.svg'}
            className="w-full h-auto"
            unoptimized
          />
        </div>
        <div className="h-screen" />
      </main>
    </>
  )
}
