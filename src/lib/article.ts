import { Profile } from '@/payload-types'

// { value: 'published', label: 'Published' },
// { value: 'pending', label: 'Pending' },
// { value: 'rejected', label: 'Rejected' },
// Map of allowed article type values to their Greek labels
const ARTICLE_STATUS_LABELS: Record<string, string> = {
  published: 'Δημόσιο',
  pending: 'Σε επεξεργασία',
  rejected: 'Απορρίφθηκε',
}
const ARTICLE_TYPE_LABELS: Record<string, string> = {
  politics: 'Πολιτική',
  society: 'Κοινωνία',
  culture: 'Πολιτισμός',
  identity: 'Ταυτότητα',
  environment: 'Περιβάλλον',
  technology: 'Τεχνολογία',
  education: 'Εκπαίδευση',
  feminism: 'Φεμινισμός',
  poetry: 'Ποίηση',
  personal: 'Προσωπικό',
}

export function getArticleLabel(type: string | undefined | null): string | undefined {
  if (!type) return undefined
  return ARTICLE_TYPE_LABELS[type] ?? undefined
}

export function getArticleStatus(status: string | undefined | null): string | undefined {
  if (!status) return undefined
  return ARTICLE_STATUS_LABELS[status] ?? undefined
}

export const articleTypes = [
  {
    label: 'Πολιτική',
    value: 'politics',
  },
  {
    label: 'Κοινωνία',
    value: 'society',
  },
  {
    label: 'Πολιτισμός',
    value: 'culture',
  },
  {
    label: 'Ταυτότητα',
    value: 'identity',
  },
  {
    label: 'Περιβάλλον',
    value: 'environment',
  },
  {
    label: 'Τεχνολογία',
    value: 'technology',
  },
  {
    label: 'Εκπαίδευση',
    value: 'education',
  },
  {
    label: 'Φεμινισμός',
    value: 'feminism',
  },
  {
    label: 'Ποίηση',
    value: 'poetry',
  },
  {
    label: 'Προσωπικό',
    value: 'personal',
  },
]

// Checks if a given string is a valid article type value
export function isArticleType(value: string | undefined | null): boolean {
  if (typeof value !== 'string') return false
  return Object.prototype.hasOwnProperty.call(ARTICLE_TYPE_LABELS, value)
}

export function getAuthor(author: unknown) {
  if (!author || typeof author !== 'object') {
    return null
  }
  let name = ''
  let age = 0
  // @ts-ignore
  name = author.name

  // @ts-ignore
  if (!('birthday' in author) || !('createdAt' in author)) return null
  const birthday = new Date((author as any).birthday)
  const createdAt = new Date((author as any).createdAt)
  let aget = createdAt.getFullYear() - birthday.getFullYear()
  const m = createdAt.getMonth() - birthday.getMonth()
  if (m < 0 || (m === 0 && createdAt.getDate() < birthday.getDate())) {
    aget--
  }
  age = aget

  return { name, age }
}
