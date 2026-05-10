'use client'
import { toast } from 'sonner'
import { useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import Toaster from '../account/toater'

export default function Page() {
  const [page, setPage] = useState(0)
  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [error, setError] = useState('')
  const { user } = useUser()
  const router = useRouter()
  const params = useSearchParams()
  const to = decodeURIComponent(params.get('to') ?? '/')
  async function next() {
    setError('')
    if (page === 0) {
      if (name === '' || name.length < 4) {
        toast.error('Συμπλήρωσε το όνομά σου πρώτα.')
        return
      }
      setPage(1)
      return
    }
    if (!birthday || (typeof birthday === 'string' && birthday.trim() === '')) {
      toast.error('Συμπλήρωσε τα γεννέθλιά σου')
      return
    } else {
      const [yearStr, monthStr, dayStr] = birthday.slice(0, 10).split('-')
      const yearNum = Number(yearStr)
      const monthNum = Number(monthStr)
      const dayNum = Number(dayStr)
      const birthDate = new Date(yearNum, monthNum - 1, dayNum)
      if (isNaN(birthDate.getTime())) {
        toast.error('Συμπλήρωσε τα γεννέθλιά σου')
        return
      } else {
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        if (age < 13 || age > 23) {
          toast.error('Πρέπει να είσαι μεταξύ 13 και 23 ετών.')
          return
        }
      }
    }

    let toastId: string | number | undefined = undefined
    try {
      toastId = toast.loading('Αποθήκευση...', { duration: 999999 })
      const req = await fetch('./api/front/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          name,
          birthday,
        }),
      })
      if (!req.ok) {
        const res = await req.json()
        toast.error(res.error ?? 'Δεν ήταν δυνατή η ενημέρωση του προφίλ σας')
        return
      } else {
        await user?.reload()
        if (to) {
          // Only allow navigation if 'to' is a relative URL (to prevent open redirect)
          try {
            const url = new URL(to, window.location.origin)
            if (url.origin === window.location.origin) {
              router.push(to)
            } else {
              router.push('/')
            }
          } catch {
            // If invalid URL, fallback to default push (relative)
            router.push('/')
          }
        }
        toast.dismiss()
        return
      }
    } catch (error) {
      toast.error('Παρουσιάστηκε άγνωστο σφάλμα', {
        description: 'Έχουμε ειδοποιηθεί. Δοκιμάστε ξανά αργότερα.',
      })
      return
    } finally {
      if (toastId !== undefined) toast.dismiss(toastId)
    }
  }
  return (
    <div className="w-fit">
      <div className="fixed bottom-0 z-10 right-0 px-10 py-7">
        <Toaster />
        <button onClick={next} className="px-8 py-2 text-lg bg-white text-black">
          Έπομενο
        </button>
      </div>
      <AnimatePresence initial={false} mode="wait">
        {page === 0 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className="max-w-xl mx-auto bg-[#1A1A1A] z-10 relative flex flex-col py-10 max-sm:px-6 px-10"
          >
            <p className="text-3xl">Το όνομά σου</p>
            <p className="mt-1 mb-3 text-pretty opacity-70">
              Συμπλήρωσε το όνομά σου όπως θέλεις να εμφανίζεται στα κείμενά σου.
            </p>
            <div className="relative w-full sm:flex items-center space-x-3 flex-col flex">
              <input
                required
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key.toLowerCase() === 'enter') {
                    next()
                  }
                }}
                className="outline-none font-mono w-full border-white/40 px-2 border-b text-lg py-3"
              />
              <FieldError e={error} />
            </div>
          </motion.div>
        )}
        {page === 1 && (
          <motion.div
            key="birthday"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className="max-w-xl mx-auto bg-[#1A1A1A] z-10 relative flex flex-col py-10 max-sm:px-6 px-10"
          >
            <p className="text-3xl">Τα γεννέθλιά σου</p>
            <p className="mt-1 mb-3 text-pretty opacity-70">
              Ζητάμε να μάθουμε την ηλικία σου για να διασφαλίσουμε πως μόνο άτομα ηλικίας 13-23
              βρίσκονται στην πλατφόρμα.
            </p>
            <div className="relative w-full sm:flex items-center space-x-3 flex-col flex">
              <BirtdayInput value={birthday} setValue={setBirthday} />
              <FieldError e={error} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BirtdayInput({
  value,
  setValue,
}: {
  value: string | null | undefined
  setValue: (_: string) => void
}) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [focused, setFocused] = useState<'day' | 'month' | 'year' | null>()
  const dayRef = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!value) return
    setDay(new Date(value).getDate().toString())
    setMonth((new Date(value).getMonth() + 1).toString())
    setYear(new Date(value).getFullYear().toString())
  }, [])
  useEffect(() => {
    const dateString =
      day && month && year
        ? `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        : ''
    setValue(dateString)
    if (day.length === 1 && focused !== 'day') setDay('0' + day)
    if (month.length === 1 && focused !== 'month') setMonth('0' + month)
  }, [day, month, year, focused])

  function type(value: string, focused: string) {
    if (focused === 'day') {
      if (parseInt(value) > 31) return
      setDay(value)
      if ((value.length === 2 || parseInt(value) > 3) && monthRef.current) {
        setMonth('')
        monthRef.current.focus()
      }
    }
    if (focused === 'month') {
      if (parseInt(value) > 12) return
      setMonth(value)
      if ((value.length === 2 || value !== '1') && yearRef.current) {
        setYear('')
        yearRef.current.focus()
      }
    }
    if (focused === 'year') {
      setYear(value)
    }
  }
  return (
    <div className="w-full flex items-center">
      <input
        required
        placeholder="DD"
        value={day}
        inputMode="numeric"
        autoFocus
        ref={dayRef}
        onFocus={() => setFocused('day')}
        onChange={(e) => type(e.target.value, 'day')}
        maxLength={2}
        className="outline-none font-mono w-14 border-white/40 px-2 border-b text-lg py-3 text-center"
      />
      <p className="text-xl px-2 font-mono">/</p>
      <input
        required
        inputMode="numeric"
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && month === '') {
            setDay('')
            dayRef.current?.focus()
          }
        }}
        ref={monthRef}
        placeholder="MM"
        value={month}
        onFocus={() => setFocused('month')}
        onChange={(e) => type(e.target.value, 'month')}
        maxLength={2}
        className="outline-none font-mono w-14 border-white/40 px-2 border-b text-lg py-3 text-center"
      />
      <p className="text-xl px-2 font-mono">/</p>
      <input
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && year === '') {
            setMonth('')
            monthRef.current?.focus()
          }
        }}
        required
        inputMode="numeric"
        ref={yearRef}
        placeholder="YYYY"
        value={year}
        maxLength={4}
        onFocus={() => setFocused('year')}
        onChange={(e) => setYear(e.target.value)}
        className="outline-none font-mono w-18 border-white/40 px-2 border-b text-lg py-3 text-center"
      />
    </div>
  )
}

function FieldError({ e }: { e: string }) {
  return (
    e && (
      <>
        <p className="text-[#F00] font-mono text-sm mt-2">{e === 'req' ? 'Απαραίτητο πεδίο' : e}</p>
      </>
    )
  )
}
