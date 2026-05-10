import index from '@/lib/search'
import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeValidateHook,
} from 'payload'
import slugify from 'slugify'
import { v4 } from 'uuid'

export async function revalidate({ slug, type }: { slug: string; type: string }) {
  await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/front/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.WEBHOOK_SECRET}`,
    },
    body: JSON.stringify({
      tags: [`a:${slug}`, 'a', `a-${type}`],
    }),
  })
}

export const requestRevalidation: CollectionAfterChangeHook = async function ({ doc }) {
  if (doc.application.status === 'published') {
    await revalidate({ slug: doc.slug, type: doc.type })
    return
  }
  return
}

export const syncSearch: CollectionAfterChangeHook = async function ({
  operation,
  previousDoc,
  doc,
}) {
  if (operation === 'create') {
    await index.upsert([
      {
        id: doc.id,
        content: {
          title: doc.title,
          description: doc.description,
        },
        metadata: {
          genre: doc.type,
          slug: doc.slug,
        },
      },
    ])
    return
  } else {
    const titleSame = previousDoc.title.replaceAll(' ', '') === doc.title.replaceAll(' ', '')
    const descriptionSame =
      previousDoc.description.replaceAll(' ', '') === doc.description.replaceAll(' ', '')
    const typeSame = previousDoc.type === doc.type
    const slugSame = previousDoc.slug === doc.slug
    if (titleSame && descriptionSame && typeSame && slugSame) return
    await index.delete({ ids: [doc.id] })
    await index.upsert([
      {
        id: doc.id,
        content: {
          title: doc.title,
          description: doc.description,
        },
        metadata: {
          genre: doc.type,
          slug: doc.slug,
        },
      },
    ])
    return
  }
}

export const deleteSearch: CollectionAfterDeleteHook = async function ({ doc }) {
  await index.delete({ ids: [doc.id] })
}

export const generateSlug: CollectionBeforeValidateHook = async function ({
  data,
  req,
  operation,
  originalDoc,
}) {
  if (typeof data?.slug === 'string' && data.slug.trim().length > 0) {
    data.slug = slugify(data.slug, {
      lower: true,
      strict: true,
    })
    return data
  }

  // Only generate slug if there is a title
  if (typeof data?.title === 'string' && data.title.trim().length > 0) {
    // Create base slug from first 6 words of the title
    const words = data.title.trim().split(/\s+/).slice(0, 6)
    const baseTitle = words.join(' ')
    let baseSlug = slugify(baseTitle, {
      lower: true,
      strict: true,
    })

    let finalSlug = baseSlug

    // If this is an update, and the title didn't change, keep existing slug
    if (operation === 'update' && originalDoc) {
      // If no title change and original slug exists, retain it
      const origTitleWords = (originalDoc.title || '').trim().split(/\s+/).slice(0, 6)
      const origBaseTitle = origTitleWords.join(' ')
      // Ignore case and spaces
      if (
        slugify(origBaseTitle, { lower: true, strict: true }) === baseSlug &&
        typeof originalDoc.slug === 'string'
      ) {
        data.slug = originalDoc.slug
        return data
      }
    }

    // Only check for collisions on create or if the title changed
    if (req?.payload) {
      let querySlug = baseSlug
      const result = await req.payload.find({
        collection: 'article',
        where: {
          slug: { equals: querySlug },
        },
        limit: 1,
      })
      // Check for collision: Only consider it a collision if not the same document
      let isCollision = result?.docs?.length > 0 && (!data.id || result.docs[0].id !== data.id)

      if (isCollision) {
        finalSlug = `${baseSlug}-${v4().split('-')[0]}`
      }
    }

    data.slug = finalSlug
  }

  return data
}
