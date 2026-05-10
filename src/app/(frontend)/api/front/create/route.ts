import getPayload from '@/lib/payload'
import { NextResponse } from 'next/server'
import { isArticleType } from '@/lib/article'
import sanitizeHtml from 'sanitize-html'
import getAuth from '@/lib/getAuth'

export async function POST(req: Request) {
  const uid = await getAuth()
  if (!uid) {
    return NextResponse.json(
      {
        authError: true,
        title: 'Παρακαλούμε συνδεθείτε',
        message: 'Η αποστολή άρθρου είναι δυνατή μόνο για συνδεδεμένους χρήστες',
      },
      { status: 403 },
    )
  }

  const { title, category, summary, content, image } = await req.json()

  if (!title || !category || !summary || !content)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  if (!isArticleType(category))
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const clean = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'p', 'b', 'i', 'a']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt'],
      '*': ['class'],
      a: ['href'],
    },
  })

  const payload = await getPayload()

  try {
    await payload.create({
      collection: 'article',
      data: {
        title,
        type: category,
        description: summary,
        application: {
          status: 'pending',
        },
        author: uid,
        contentRaw: clean,
        image: image,
      },
    })
    return NextResponse.json(
      {
        status: 'success',
      },
      { status: 200 },
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { title: 'Ουπς... Σφάλμα', message: 'Δεν μπορέσαμε να στείλουμε το κείμενό σου.' },
      { status: 500 },
    )
  }
}
