'use client'

import { Select, Textarea } from '@headlessui/react'
import { Suspense, useRef, useState } from 'react'
import { articleTypes } from '@/lib/article'
import Menu from '@/components/menu'
import { useDropzone } from 'react-dropzone'
import Editor, { LexicalEditorRef } from '@/components/editor'
import { toast, Toaster } from 'sonner'
import { FilmGrain, Shader, Swirl } from 'shaders/react'
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
  const [category, setCategory] = useState('politics')
  const [summary, setSummary] = useState('')
  const editorRef = useRef<LexicalEditorRef>(null)
  async function submitArticle() {
    const html = editorRef.current?.getHTML() || ''
    const text = new DOMParser().parseFromString(html, 'text/html').body.textContent
    // Safely check text before calling split to prevent TypeError
    const textWordCount = typeof text === 'string' ? text.split(' ').length : 0
    if (!title || !category || !summary || !text || textWordCount < 10) {
      let imageErr = ''
      if (acceptedFiles && acceptedFiles[0]) {
        const file = acceptedFiles[0]
        if (file.size > 2 * 1024 * 1024) {
          imageErr = 'Η εικόνα δεν πρέπει να υπερβαίνει τα 2MB.'
        }
      }
      setErrors({
        title: !title ? 'req' : '',
        category: !category ? 'req' : '',
        summary: !summary ? 'req' : '',
        image: imageErr,
        content: textWordCount < 10 ? 'Το κείμενο πρέπει να είναι πάνω από 10 λέξεις.' : '',
      })
      return
    }
    const formData = new FormData()
    formData.append('title', title)
    formData.append('category', category)
    formData.append('summary', summary)
    formData.append('content', html)
    if (acceptedFiles && acceptedFiles[0]) {
      formData.append('image', acceptedFiles[0])
    }

    try {
      const res = await fetch('/api/front/create', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()

        toast.error(data.title || 'Αποτυχία υποβολής άρθρου', {
          description: data.message || 'Η υποβολή του άρθρου απέτυχε. Παρακαλούμε δοκιμάστε ξανά.',
        })
        throw new Error(JSON.stringify(data))
      }

      const data = await res.json()
      toast.success('Το άρθρο υποβλήθηκε επιτυχώς', {
        description: 'Το άρθρο σου έχει αποσταλεί για επιμέλεια.',
      })
      return data
    } catch (error: any) {
      toast.error('Σφάλμα κατά την υποβολή', {
        description: 'Παρουσιάστηκε σφάλμα κατά την αποστολή του άρθρου. Δοκίμασε ξανά.',
      })
      console.error('Error submitting article:', error)
    }
  }

  return (
    <>
      <Menu />
      <div className="text-white bg-[#4E148C] pt-32 min-h-screen max-sm:px-3 px-10">
        <Toaster />
        <div
          className={`fixed inset-0 z-0 transition-opacity duration-700 `}
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
        <div className="p-10 fixed top-32 left-0 w-full z-10">
          <h1 className="text-5xl text-center tracking-tight">Μοιράσου τη φωνή σου</h1>
          <h2 className="text-center text-xl mt-3 opacity-90">
            Γράψε για ό,τι σε απασχολεί — εμπειρίες, απόψεις, ιδέες.
          </h2>
        </div>
        <div className="max-w-5xl mx-auto bg-[#1A1A1A] mt-64 z-10 relative flex flex-col rounded-t-4xl space-y-10 py-14 max-sm:px-6 px-10">
          <div className="relative w-full flex items-center space-x-3">
            <p className="text-3xl py-3 ">Τίτλος</p>
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
          <div className="relative w-full flex items-center space-x-3">
            <p className="text-3xl py-3 ">Κατηγορία</p>
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
          <div className="relative w-full flex items-start space-x-3">
            <p className="text-3xl py-3 ">Περίληψη</p>
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
          <div className="relative w-full flex items-start space-x-3">
            <p className="text-3xl py-3 ">Εικόνα</p>
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
          <button onClick={submitArticle} className="mx-auto mt-6 w-full py-4 font-mono border">
            Αποστολή
          </button>
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
