import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function isValidImage(image: any) {
  if (!image || typeof image !== 'object') return false
  // Check for Payload Media object (has url property)
  if ('url' in image && typeof image.url === 'string' && image.url.length > 0) {
    return true
  }
  // Check for UserMedia (has lqip property or url, common in user uploads)
  if (
    'lqip' in image ||
    ('url' in image && typeof image.url === 'string' && image.url.length > 0)
  ) {
    return true
  }
  return false
}
