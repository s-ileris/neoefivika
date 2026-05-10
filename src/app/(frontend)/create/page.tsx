'use client'

import { Select, Textarea } from '@headlessui/react'
import { Suspense, useRef, useState } from 'react'
import { articleTypes } from '@/lib/article'
import { useDropzone } from 'react-dropzone'
import Editor, { LexicalEditorRef } from '@/components/editor'
import { toast, Toaster } from 'sonner'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
const initialErrors = {
  title: '',
  category: '',
  summary: '',
  image: '',
  content: '',
}

export default function Page() {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.avif', '.webp'],
    },
    maxFiles: 1,
    noClick: false,
    noKeyboard: false,
  })
  const [errors, setErrors] = useState(initialErrors)
  const [title, setTitle] = useState('')
  const [uploadProgrress, setUploadProgrress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [category, setCategory] = useState('politics')
  const [summary, setSummary] = useState('')
  const editorRef = useRef<LexicalEditorRef>(null)
  async function submitArticle(e: any) {
    e.preventDefault()
    const html = editorRef.current?.getHTML() || ''
    const text = new DOMParser().parseFromString(html, 'text/html').body.textContent
    const textWordCount = typeof text === 'string' ? text.split(' ').length : 0
    const file = acceptedFiles && acceptedFiles[0]
    if (
      !title ||
      !category ||
      !summary ||
      !text ||
      textWordCount < 10 ||
      (file && file.size > 4 * 1024 * 1024)
    ) {
      setErrors({
        title: !title ? 'req' : '',
        category: !category ? 'req' : '',
        summary: !summary ? 'req' : '',
        image:
          file && file.size > 4 * 1024 * 1024 ? 'Η εικόνα δεν πρέπει να υπερβαίνει τα 4MB.' : '',
        content: textWordCount < 10 ? 'Το κείμενο πρέπει να είναι πάνω από 10 λέξεις.' : '',
      })
      return
    }
    let media = null
    setLoading(true)

    if (acceptedFiles && acceptedFiles[0]) {
      setUploadProgrress(1)
      //1-20
      setTimeout(() => setUploadProgrress(Math.floor(Math.random() * 20) + 1), 300)

      const file = acceptedFiles[0]
      const urlResponse = await fetch('/api/front/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'media',
          filename: file.name,
          contentType: file.type,
        }),
      })
      //30-40
      setTimeout(() => setUploadProgrress(Math.floor(Math.random() * 10) + 30), 300)

      const { signedUrl, key, alias } = await urlResponse.json()

      await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      }).catch(() => {
        toast.error('Σφάλμα κατα την μεταφόρτωση εικόνας.')
        setUploadProgrress(0)
        return
      })
      if (!key) {
        toast.error('Σφάλμα κατα την μεταφόρτωση εικόνας.')
        return
      }
      // 50-70
      setUploadProgrress(Math.floor(Math.random() * 20) + 50)

      const mediaResponse = await fetch('/api/front/media/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          alias: alias,
          filename: file.name,
          mimeType: file.type,
          filesize: file.size,
          collection: 'media',
        }),
      })
      media = await mediaResponse.json()
      if (!media.id) {
        setUploadProgrress(0)

        toast.error('Σφάλμα κατα την προσθήκη εικόνας.')
        return
      }
      //80-100
      setUploadProgrress(Math.floor(Math.random() * 20) + 80)
    }
    await fetch('/api/front/create', {
      method: 'POST',
      body: JSON.stringify({
        title,
        category,
        summary,
        content: html,
        image: media ? media.id : null,
      }),
      credentials: 'include',
    })
      .then(async (res) => {
        setUploadProgrress(100)
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.title || 'Αποτυχία υποβολής άρθρου', {
            description:
              data.message || 'Η υποβολή του άρθρου απέτυχε. Παρακαλούμε δοκιμάστε ξανά.',
          })
          throw new Error(JSON.stringify(data))
        }
        const data = await res.json()
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return data
      })
      .catch((error) => {
        toast.error('Σφάλμα κατά την υποβολή', {
          description: 'Παρουσιάστηκε σφάλμα κατά την αποστολή του άρθρου. Δοκίμασε ξανά.',
        })
        console.error('Error submitting article:', error)
      })
      .finally(() => {
        setLoading(false)
        setTimeout(() => setUploadProgrress(0), 1000)
      })
  }

  return (
    <>
      <AnimatePresence>
        {uploadProgrress > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed z-100 bottom-2 sm:bottom-5 right-2 sm:right-5 bg-white min-w-xs space-y-3 flex flex-col items-start text-black shadow-lg px-5 py-4 border border-black/10"
          >
            <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-purple transition-all duration-700 ease-linear"
                style={{ width: `${uploadProgrress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {uploadProgrress < 100 ? `Πρόοδος: ${Math.round(uploadProgrress)}%` : 'Ολοκληρώθηκε!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-white bg-[#4E148C] pt-32 min-h-screen max-sm:px-3 px-10">
        <Toaster />
        <div
          className={`fixed inset-0 z-0 transition-opacity duration-700 `}
          style={{ contain: 'strict' }}
        >
          <iframe src="https://bg.neoefivika.gr" className="h-full w-full" />

          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="p-10 fixed top-32 left-0 w-full z-10">
          <h1 className="text-5xl text-center tracking-tight">Μοιράσου τη φωνή σου</h1>
          <h2 className="text-center text-xl mt-3 opacity-90">
            Γράψε για ό,τι σε απασχολεί — εμπειρίες, απόψεις, ιδέες.
          </h2>
        </div>
        <div className="max-w-5xl mx-auto bg-[#1A1A1A] mt-64 z-10 relative flex flex-col rounded-t-4xl space-y-10 max-sm:space-y-12 py-14 max-sm:px-6 px-10">
          {submitted ? (
            <div className="flex flex-col max-w-md mx-auto py-10 text-center ">
              <h3 className="text-3xl">Το άρθρο υποβλήθηκε επιτυχώς</h3>
              <p className="mt-2">
                Το άρθρο σου έχει αποσταλεί για επιμέλεια. Ενημερώσου για την πρόοδο από την σελίδα{' '}
                <Link href="/account" className="underline">
                  λογαρισμός.
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="relative w-full sm:flex items-center space-x-3">
                <p className="text-3xl sm:py-3 pb-3 max-sm:pl-3">Τίτλος</p>
                <div className="w-full">
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="outline-none font-mono w-full border-white/40 px-2 border-b text-lg py-3"
                  />
                  <FieldError e={errors.title} />
                </div>
              </div>
              <div className="relative w-full sm:flex items-center space-x-3">
                <p className="text-3xl sm:py-3 pb-3 max-sm:pl-3">Κατηγορία</p>
                <div className="w-full">
                  <Select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="outline-none font-mono w-full border-white/40 px-2 border-b text-lg py-3"
                  >
                    {articleTypes.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </Select>
                  <FieldError e={errors.category} />
                </div>
              </div>
              <div className="relative w-full sm:flex items-start space-x-3">
                <p className="text-3xl sm:py-3 max-sm:pb-3 max-sm:pl-3 ">Περίληψη</p>
                <div className="w-full">
                  <Textarea
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="outline-none max-h-32 font-mono w-full border-white/40 px-2 border-b text-lg py-3"
                  ></Textarea>{' '}
                  <FieldError e={errors.summary} />
                </div>
              </div>
              <div className="relative w-full sm:flex items-start space-x-3">
                <p className="text-3xl sm:py-3 pb-3 max-sm:pl-3">Εικόνα</p>
                <div className="w-full">
                  <div
                    {...getRootProps({
                      className:
                        'outline-none max-h-32 font-mono w-full border-white/40 px-2 border-b text-lg py-3',
                    })}
                  >
                    <input {...getInputProps()} />
                    {acceptedFiles.length ? (
                      <>
                        <p className="max-sm:hidden">{acceptedFiles[0].name}</p>
                        <p className="sm:hidden">
                          {acceptedFiles[0].name.length > 20 && '...'}
                          {acceptedFiles[0].name.slice(-20)}
                        </p>
                      </>
                    ) : (
                      <p>Σύρετε εικόνα εδώ ή κάνετε κλικ για επιλογή.</p>
                    )}
                  </div>
                  <FieldError e={errors.image} />
                </div>
              </div>
              <Suspense>
                <Editor ref={editorRef} />
                <div className="-mt-8!">
                  <FieldError e={errors.content} />
                </div>
              </Suspense>
              <button
                disabled={loading}
                onClick={submitArticle}
                className="mx-auto disabled:opacity-50 mt-6 w-full py-4 font-mono border"
              >
                {loading ? 'Αποστολή...' : 'Αποστολή'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function FieldError({ e }: { e: string }) {
  return (
    e && (
      <>
        <p className="text-red-400 font-mono mt-2">{e === 'req' ? 'Απαραίτητο πεδίο' : e}</p>
      </>
    )
  )
}
