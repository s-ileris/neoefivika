import getPayload from '@/lib/payload'
import { auth0 } from '@/lib/auth0'
import { NextResponse } from 'next/server'
import { v1 } from 'uuid'
import { isArticleType } from '@/lib/article'
import sanitizeHtml from 'sanitize-html'

export async function POST(req: Request) {
  const session = await auth0.getSession()

  if (!session)
    return NextResponse.json(
      {
        authError: true,
        title: 'Παρακαλούμε συνδεθείτε',
        message: 'Η αποστολή άρθρου είναι δυνατή μόνο για συνδεδεμένους χρήστες',
      },
      { status: 403 },
    )
  const formData = await req.formData()
  const payload = await getPayload()
  const title = formData.get('title') as string | null
  const type = formData.get('category') as string | null
  const description = formData.get('summary') as string | null
  const content = formData.get('content') as string | null
  const image = formData.get('image') as File | null

  if (!title || !type || !description || !content)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  if (!isArticleType(type)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const clean = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'p', 'b', 'i', 'a']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt'],
      '*': ['class'],
      a: ['href'],
    },
  })

  if (image) {
    try {
      const arrayBuffer = await image.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const imageUpload = await payload.create({
        collection: 'media',
        data: {},
        file: {
          data: buffer,
          mimetype: image.type,
          name: v1(),
          size: image.size,
        },
      })

      if (imageUpload.id) {
        await payload.create({
          collection: 'article',
          data: {
            title,
            //@ts-ignore handled above
            type,
            description,
            application: {
              status: 'pending',
            },
            author: session.user.sub,
            contentRaw: clean,
            image: imageUpload.id,
          },
        })
      } else {
        return NextResponse.json(
          {
            title: 'Ουπς... Σφάλμα μεταφόρτωσης',
            message: 'Δεν μπορέσαμε να ανεβάσουμε την εικόνα σου.',
          },
          { status: 500 },
        )
      }
    } catch (e) {
      console.error(e)
      return NextResponse.json(
        { title: 'Ουπς... Σφάλμα', message: 'Δεν μπορέσαμε να στείλουμε το κείμενό σου.' },
        { status: 500 },
      )
    }
  } else {
    try {
      await payload.create({
        collection: 'article',
        data: {
          title,
          //@ts-ignore handled above
          type,
          author: session.user.sub,
          description,
          application: {
            status: 'pending',
          },
          contentRaw: clean,
        },
      })
    } catch (e) {
      console.error(e)
      return NextResponse.json(
        { title: 'Ουπς... Σφάλμα', message: 'Δεν μπορέσαμε να στείλουμε το κείμενό σου.' },
        { status: 500 },
      )
    }
  }
  return NextResponse.json(
    {
      title: 'Λάβαμε το κείμενό σου',
      message: 'Θα σε ενημερώσουμε με email για την δημοσίευσή του!',
    },
    { status: 200 },
  )
}
