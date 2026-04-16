'use client'
import { getArticleStatus } from '@/lib/article'
import { Article } from '@/payload-types'
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { WarningIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ArticlesResponse {
  docs: Article[]
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
  nextPage: number | null
  page: number
  pagingCounter: number
  prevPage: number | null
  totalDocs: number
  totalPages: number
}

export default function MyArticles() {
  const [open, setOpen] = useState(false)
  const [articles, setArticles] = useState<null | ArticlesResponse>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<Article | null>(null)
  useEffect(() => {
    setLoading(true)
    fetch('/api/front/account/articles')
      .then(async (res) => {
        if (!res.ok) {
          setError('Failed to fetch articles')
          return
        }
        const data = await res.json()
        setArticles(data)
      })
      .catch((error) => {
        setArticles(null)
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
  if (loading) return
  return (
    <>
      <section className="max-w-6xl mx-auto px-5 mt-18">
        <h2 className="text-4xl font-medium mb-4">Τα κείμενά μου</h2>
        {error && (
          <div className="bg-[#F00] px-6 py-4 text-white font-medium flex items-center ">
            <WarningIcon size={28} />
            <p className="ml-4">
              {'Σφάλμα: '}
              {error}
            </p>
          </div>
        )}
        {!articles?.docs.length && (
          <div className="grid place-items-center border border-black/10 p-8 bg-[#D1D5DB10]">
            <div className="text-center flex flex-col max-w-md">
              <p className="font-medium text-2xl mb-1">Κανένα άρθρο</p>
              <p className="opacity-70">
                Δεν έχεις υποβάλλει κανένα άρθρο. Ενημερώσου εδώ για την πρόοδο της αίτησής σου και
                διαχειρήσου τα δημοσιοποιημένα.
              </p>
              <div className="flex space-x-3 mx-auto mt-8">
                <Link href={'help'} className="border border-black/20 px-8 py-2 w-fit font-medium">
                  Βοήθεια
                </Link>
                <Link
                  href={'create'}
                  className="bg-[#4E148C] border-[#4E148C] border text-white px-8 py-2 w-fit font-medium"
                >
                  Γράψε
                </Link>
              </div>
            </div>
          </div>
        )}
        <div>
          {articles &&
            articles.docs.map((item, idx) => (
              <div key={idx} className="flex mb-2">
                <Link href={'/article/' + item.slug} className="font-mono flex tracking-tight">
                  <p className="opacity-60 mr-4">
                    {(() => {
                      const date = new Date(item.createdAt)
                      const day = date.getDate().toString().padStart(2, '0')
                      const month = (date.getMonth() + 1).toString().padStart(2, '0')
                      const year = date.getFullYear().toString().slice(-2)
                      return `[${day}-${month}-${year}]`
                    })()}
                  </p>

                  <p>{item.title}</p>
                </Link>
                {item.application && (
                  <div className="ml-auto text-base ">
                    <button
                      onClick={() => {
                        if (item.application?.status === 'rejected') {
                          setOpen(true)
                          setOpenId(item)
                        }
                      }}
                      className={'font-mono text-sm tracking-tight underline'}
                    >
                      {getArticleStatus(item.application.status)}
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </section>
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 flex w-screen items-center justify-center p-2 transition-colors">
          <DialogPanel className="max-w-lg min-w-sm flex flex-col border bg-white p-8">
            <p className="opacity-80 text-sm">Λόγος απόρριψης κειμένου</p>
            <DialogTitle className="font-medium text-2xl">{openId?.title}</DialogTitle>
            <Description className={'mt-2'}>
              {openId?.application && openId?.application.reason}
            </Description>
            <div className="ml-auto mt-6">
              <button
              autoFocus
                className="bg-[#4E148C] border-[#4E148C] border text-white px-8 py-2 w-fit font-medium"
                onClick={() => setOpen(false)}
              >
                Κατανοώ
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
