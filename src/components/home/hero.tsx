"use client"
import { Suspense, useEffect, useRef, useState } from "react"
import { FilmGrain, Shader, Swirl } from "shaders/react"
import Menu from "../menu"
import Image from "next/image"

export default function HeroSection() {
    const [isLoaded, setIsLoaded] = useState(false)
    const shaderContainerRef = useRef<HTMLDivElement>(null)
  
    useEffect(() => {
      const checkShaderReady = () => {
        if (shaderContainerRef.current) {
          const canvas = shaderContainerRef.current.querySelector('canvas')
          if (canvas && canvas.width > 0 && canvas.height > 0) {
            setIsLoaded(true)
            return true
          }
        }
        return false
      }
  
      if (checkShaderReady()) return
  
      const intervalId = setInterval(() => {
        if (checkShaderReady()) {
          clearInterval(intervalId)
        }
      }, 100)
  
      const fallbackTimer = setTimeout(() => {
        setIsLoaded(true)
      }, 1500)
  
      return () => {
        clearInterval(intervalId)
        clearTimeout(fallbackTimer)
      }
    }, [])
  
    return (
      <>
        <Menu />
        <main suppressHydrationWarning className="relative w-full overflow-hidden bg-background">
          <div
            ref={shaderContainerRef}
            className={`fixed inset-0 -z-10 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ contain: 'strict' }}
          >
            <Suspense>
              <Shader disableTelemetry={true} className="h-full w-full">
                <Swirl colorA="#4E148C" colorB="#9842FF" speed={0.5} detail={1} blend={50} />
                <FilmGrain strength={0.3} opacity={1} visible />
              </Shader>
            </Suspense>
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
  