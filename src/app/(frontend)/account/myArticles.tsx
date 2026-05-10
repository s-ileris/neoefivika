'use client'
import PImage from '@/components/PayloadImage'
import { Skeleton } from '@/components/ui/skeleton'
import { getArticleLabel, getArticleStatus } from '@/lib/article'
import { isValidImage } from '@/lib/utils'
import { Article } from '@/payload-types'
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { ArrowSquareOutIcon } from '@phosphor-icons/react'
import { EyeIcon, TrashSimpleIcon, WarningIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'

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
const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      throw new Error('Failed to fetch articles')
    }
    return res.json()
  })
export default function MyArticles() {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<Article | null>(null)
  const [verifyDelete, setVerifyDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const getViewCount = async (id: number | undefined) => {
    if (!id) return null
    const res = await fetch('/api/front/views/' + id)
    if (!res.ok) {
      return { error: 'Οι προβολές δεν είναι προσωρινά διαθέσιμες.' }
    }
    const data = await res.json()
    return { total: data?.total ?? 0 }
  }

  const { data: openViewsData } = useSWRImmutable(
    openId ? `/api/front/views/${openId.id}` : null,
    () => getViewCount(openId?.id),
    { keepPreviousData: true },
  )

  const viewsError = openViewsData && openViewsData.error ? openViewsData.error : undefined
  const openViews =
    openViewsData && typeof openViewsData.total === 'number' ? openViewsData.total : undefined

  const [accumulatedData, setAccumulatedData] = useState<ArticlesResponse | null>(null)
  const { data, error, isLoading, mutate } = useSWR<ArticlesResponse>(
    `/api/front/account/articles?page=${page}`,
    fetcher,
    {
      keepPreviousData: true,
    },
  )
  function deleteArticle(id: number) {
    setDeleteLoading(true)
    fetch('/api/front/account/articles', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })
      .then(async (res) => {
        if (!res.ok) {
          let data
          try {
            data = await res.json()
          } catch {
            data = {}
          }
          toast.error('Αποτυχία διαγραφής του άρθρου.', { description: data.error })
        } else {
          setAccumulatedData(null)
          mutate()
          setVerifyDelete(false)
          setOpen(false)
          setOpenId(null)
        }
      })
      .catch((err) => {
        toast.error('Αποτυχία διαγραφής του άρθρου.', { description: 'Άγνωστο σφάλμα' })
      })
      .finally(() => {
        setDeleteLoading(false)
      })
  }

  useEffect(() => {
    if (!data) return

    setAccumulatedData((prev) => {
      if (page === 1 || !prev) {
        return data
      }
      if (prev.docs.some((doc) => data.docs.find((d) => d.id === doc.id))) {
        return prev
      }
      return {
        ...data,
        docs: [...(prev.docs ?? []), ...(data.docs ?? [])],
        page: data.page,
        nextPage: data.nextPage,
        prevPage: data.prevPage,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
        limit: data.limit,
        pagingCounter: data.pagingCounter,
        totalDocs: data.totalDocs,
        totalPages: data.totalPages,
      }
    })
  }, [data, page])

  // We'll use accumulatedData in rendering instead of just data

  const hasNextPage = page !== data?.totalPages
  if (isLoading && !data)
    return (
      <section className="max-w-6xl mx-auto px-5 mt-18">
        <h2 className="text-4xl font-medium mb-4">Τα κείμενά μου</h2>
        <div className="h-[33vh]" />
      </section>
    )
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
        {!accumulatedData?.docs.length && (
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
        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 max-lg:gap-4 gap-8">
          {accumulatedData &&
            accumulatedData.docs.map((item) => (
              <div
                onClick={() => {
                  setOpen(true)
                  setOpenId(item)
                }}
                key={item.id}
                className={'group relative flex flex-col ' + (!item.image && 'p-3')}
              >
                {isValidImage(item.image) ? (
                  <div className="relative">
                    <PImage
                      unoptimized
                      //@ts-ignore
                      image={item.image}
                      alt={item.title}
                      size="small"
                      width={800}
                      height={800}
                      className="object-cover aspect-square"
                    />
                    <p className="bg-white px-2 py-1 text-sm font-medium absolute bottom-2 right-2">
                      {getArticleStatus(item.application?.status)}
                    </p>
                    <p className="bg-white px-2 py-1 text-sm font-medium absolute bottom-2 left-2">
                      {getArticleLabel(item.type)}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex">
                      <p className="bg-white px-2 py-1 text-sm font-medium w-fit mb-3 border border-black/10">
                        {getArticleLabel(item.type)}
                      </p>
                      <p className="bg-white px-2 py-1 text-sm font-medium ml-auto border border-black/10 h-fit">
                        {getArticleStatus(item.application?.status)}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-[#F5F4F8] -z-10"></div>
                  </>
                )}

                <div className={item.image ? 'mt-3' : 'mt-auto'}>
                  <h1
                    className={
                      (item.image ? 'text-2xl' : 'text-3xl') +
                      ' group-hover:text-[#4E148C] font-[450] text-pretty leading-[1.2] transition-colors trakcing-tight'
                    }
                  >
                    {item.title}
                  </h1>
                </div>
              </div>
            ))}
        </div>
        {accumulatedData?.totalPages && accumulatedData?.totalPages > 1 && (
          <div className="flex flex-col items-center w-full justify-center  mt-8 gap-2">
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              disabled={isLoading || !hasNextPage}
              onClick={() => {
                setPage(page + 1)
              }}
            >
              Παραπάνω
            </button>
            <p className="text-sm mx-auto text-center">
              {page} από {data?.totalPages}
            </p>
          </div>
        )}
      </section>
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 flex w-screen items-center justify-center p-3 transition-colors">
          <DialogPanel className="max-w-lg min-w-xs sm:min-w-sm flex flex-col border bg-white py-5 px-7">
            <DialogTitle className="text-2xl">{openId?.title}</DialogTitle>
            <div className="flex items-center space-x-1.5 mt-1 opacity-50 mb-3 text-sm">
              {viewsError ? (
                <p className="text-sm text-[#c00]">{viewsError}</p>
              ) : (
                <>
                  <EyeIcon />
                  {typeof openViews === 'number' ? (
                    <span>{openViews}</span>
                  ) : (
                    <Skeleton className="h-3 w-6" />
                  )}
                </>
              )}
            </div>
            {openId?.application?.reason && (
              <div className="bg-grey my-4">
                <div className="py-3 px-4 border-b border-black/10 text-sm font-medium">
                  {openId.application.status === 'rejected'
                    ? 'Λόγος απόρριψης άρθρου'
                    : 'Σημειώσεις'}
                </div>
                <p className={'max-w-fit px-4 py-3'}>{openId?.application?.reason}</p>
              </div>
            )}
            <Link
              href={'/article/' + openId?.slug}
              target="_blank"
              className="flex space-x-1 mt-3 underline items-center text-sm"
            >
              <ArrowSquareOutIcon size={12} />
              <span>Ανάγνωση</span>
            </Link>
            <div className="flex mt-4">
              <button
                onClick={() => setVerifyDelete(true)}
                className="p-2 aspect-square bg-[#c00] grid place-items-center"
              >
                <TrashSimpleIcon size={16} fill="white" weight="bold" />
              </button>
              <button
                autoFocus
                className="bg-[#D1D5DB50] border-black/10  border text-black ml-auto px-8 py-2 w-fit font-medium"
                onClick={() => setOpen(false)}
              >
                Κλείσιμο
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      <Dialog open={verifyDelete} onClose={() => setVerifyDelete(false)} className="relative z-60">
        <div className="fixed inset-0 bg-black/40 flex w-screen items-center justify-center p-3 transition-colors">
          <DialogPanel className="max-w-lg min-w-xs flex flex-col border bg-white p-8">
            <DialogTitle className="font-medium text-2xl">Είσαι σίγουρ@;</DialogTitle>
            <Description className={'mt-2 text-pretty'}>
              Η διαγραφή ενός άρθρου είναι μη αναστρέψιμη, το περιεχόμενο θα χαθεί για πάντα αν δεν
              έχει αποθηκευτεί από εσένα.
            </Description>

            <div className="flex mt-6 h-fit">
              <button
                autoFocus
                className="bg-[#D1D5DB50] border-black/10  border text-black px-8 py-2 w-fit font-medium"
                onClick={() => setVerifyDelete(false)}
              >
                Άκυρο
              </button>
              {openId && openId.id && (
                <button
                  disabled={deleteLoading}
                  onClick={() => deleteArticle(openId.id)}
                  className="bg-[#c00] disabled:opacity-50 text-white ml-auto px-8 py-2 w-fit font-medium"
                >
                  {deleteLoading ? 'Διαγραφή...' : 'Ναι, διαγραφή'}
                </button>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
