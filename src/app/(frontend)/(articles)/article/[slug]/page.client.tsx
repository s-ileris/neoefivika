'use client'
import { Article } from '@/payload-types'
import { isValidImage } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getAuthor } from '@/lib/article'
import PImage from '@/components/PayloadImage'
import { useArticleView } from '@/lib/hooks/useView'

function ReadProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      const docHeight =
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight,
        ) - window.innerHeight

      const percent = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
      setProgress(percent)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div className="fixed top-0 left-0 z-10 w-full h-[56px] pointer-events-none">
      <motion.div
        className="h-full bg-[#D1D5DB50] z-10"
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ ease: 'easeOut', duration: 0.2 }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
        }}
      />
      <div className="absolute bg-white z-0 w-full h-full top-0 left-0" />
    </motion.div>
  )
}

export default function Page({ data }: { data: Article }) {
  useArticleView(data.id)
  return (
    <div className="pt-22">
      <ReadProgressBar />
      <div className="flex items-center justify-center flex-col px-5">
        <h1 className="text-5xl font-medium max-w-4xl mx-auto text-center">{data.title}</h1>
        <p className="text-center font-medium opacity-50 mt-6">
          {(() => {
            const date = new Date(data.createdAt)
            const day = date.getDate().toString().padStart(2, '0')
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            const year = date.getFullYear()
            return `${day}-${month}-${year}`
          })()}
        </p>
        {data.author && (
          <p className="text-center font-medium opacity-50 mt-1">
            {getAuthor(data.author)?.name}
            {getAuthor(data.author)?.age ? `, ${getAuthor(data.author)?.age} ετών` : ''}
          </p>
        )}
      </div>
      {isValidImage(data.image) && (
        <div className="px-10 max-sm:px-5 mt-12">
          <PImage
            image={data.image}
            alt={data.title + ' cover' || 'Article image'}
            unoptimized
            className="mx-auto max-w-5xl w-full h-auto"
          />
        </div>
      )}
      {data.content ? (
        <RichText className="text-xl px-5 max-w-3xl mx-auto mt-12" data={data.content} />
      ) : (
        <div
          className="text-xl px-5 max-w-3xl mx-auto mt-12 richtext"
          dangerouslySetInnerHTML={{
            __html: (data.contentRaw ?? '').replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
              const hasTarget = /target\s*=/i.test(attrs)
              const hasRel = /rel\s*=/i.test(attrs)
              let newAttrs = attrs
              if (!hasTarget) {
                newAttrs += ' target="_blank"'
              }
              if (!hasRel) {
                newAttrs += ' rel="noopener noreferrer"'
              }
              return `<a ${newAttrs}>`
            }),
          }}
        ></div>
      )}
    </div>
  )
}
