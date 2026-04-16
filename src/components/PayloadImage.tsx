import { cn } from '@/lib/utils'
import { Media, UserMedia } from '@/payload-types'
import Image from 'next/image'

type ImageSizeEntry = {
  url?: string | null
  width?: number | null
  height?: number | null
}

export default function PImage({
  image,
  width,
  height,
  alt,
  size,
  unoptimized,
  className,
  ...props
}: {
  image: Media | UserMedia
  width?: number
  height?: number
  alt?: string
  unoptimized?: boolean
  className?: string
  size?: 'thumbnail' | 'small' | 'full'
}) {
  if (!image || !image.url) return null

  let imgSrc = image.url
  let imgWidth = width ?? image.width ?? 800
  let imgHeight = height ?? image.height ?? 800

  if (size && typeof image.sizes === 'object' && image.sizes !== null) {
    let variant: ImageSizeEntry | undefined
    if (size === 'thumbnail' && 'thumbnail' in image.sizes) {
      variant = image.sizes.thumbnail
    } else if (size === 'small') {
      variant = image.sizes.small
    } else if (size === 'full') {
      variant = (image.sizes as Record<string, ImageSizeEntry | undefined>).full
    }
    if (variant?.url) {
      imgSrc = variant.url
      imgWidth = variant.width ?? imgWidth
      imgHeight = variant.height ?? imgHeight
    }
  }

  return (
    <div className="overflow-clip">
      <Image
        placeholder={image.lqip ? 'blur' : 'empty'}
        blurDataURL={image.lqip ?? ''}
        src={imgSrc}
        onLoad={(e) => e.currentTarget.classList.remove('blur-lg')}
        className={cn('blur-lg overflow-clip', className)}
        alt={alt ?? ''}
        width={imgWidth}
        height={imgHeight}
        unoptimized={unoptimized}
      />
    </div>
  )
}
