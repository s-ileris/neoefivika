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
  showbiz: 'Showbiz',
  critique: 'Κριτική',
  science: 'Επιστήμη',
  fashion: 'Μόδα',
  sport: 'Αθλητικά',
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
  {
    label: 'Showbiz',
    value: 'showbiz',
  },
  {
    label: 'Κριτική',
    value: 'critique',
  },
  {
    label: 'Επιστήμη',
    value: 'science',
  },
  {
    label: 'Μόδα',
    value: 'fashion',
  },
  {
    label: 'Αθλητικά',
    value: 'sport',
  },
]

// Checks if a given string is a valid article type value
export function isArticleType(value: string | undefined | null): boolean {
  if (typeof value !== 'string') return false
  return Object.prototype.hasOwnProperty.call(ARTICLE_TYPE_LABELS, value)
}

export function getAuthor(author: unknown, createdAt: string) {
  if (!author || typeof author !== 'object') {
    return null
  }

  // Safely extract name, birthday, and createdAt
  const { name, birthday } = author as {
    name?: string
    birthday?: string | Date
  }

  if (!name || !birthday || !createdAt) return null

  const bday = new Date(birthday)
  const cAt = new Date(createdAt)

  if (isNaN(bday.getTime()) || isNaN(cAt.getTime())) return null

  let age = cAt.getFullYear() - bday.getFullYear()
  const m = cAt.getMonth() - bday.getMonth()
  if (m < 0 || (m === 0 && cAt.getDate() < bday.getDate())) {
    age--
  }

  return { name, age }
}
