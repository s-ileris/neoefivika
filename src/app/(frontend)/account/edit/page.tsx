'use client'
import { Profile } from '@/payload-types'
import {
  MinusIcon,
  PlusIcon,
  CheckIcon,
  CaretDownIcon,
  WarningIcon,
} from '@phosphor-icons/react/dist/ssr'
import { useEffect, useRef, useState } from 'react'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import clsx from 'clsx'
import { v1 } from 'uuid'
import cities from '@/lib/cities'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import Link from 'next/link'
import ArrowLeft from '@/components/icons/arrowLeft'
import Logo from '@/components/logo'

export default function Page() {
  const [initial, setInitial] = useState<Partial<Profile> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchProfile() {
    // Keep loading true if we don't have initial (prefill) data yet
    // but if we have prefill, the UI is already visible.
    try {
      const res = await fetch('/api/front/account', { method: 'GET' })
      if (!res.ok) {
        let data: any = {}
        try {
          data = await res.json()
        } catch {}
        throw new Error(data.error || 'Σφάλμα φόρτωσης δεδομένων προφίλ')
      }
      const data = await res.json()
      // Server data overwrites prefill data here
      setInitial(data)
    } catch (err: any) {
      // Only set error if we don't even have prefill data to show
      if (!initial) {
        setError(err?.message ?? 'Άγνωστο σφάλμα')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchProfile()
  }, [])

  return (
    <>
      <div className="md:grid relative pt-20 grid-cols-5 min-h-screen w-full px-5 gap-10">
        <div className="col-span-2 max-md:mb-14">
          <div className="sticky mx-auto w-fit top-20 z-10 bg-white">
            <Link href={'/account'} className="flex items-center space-x-2 opacity-50 mb-3">
              <ArrowLeft size={16} />
              <span>Πίσω</span>
            </Link>
            <h1 className={'text-3xl font-medium'}>Επεξεργασία προφιλ</h1>
            <p className={'text-base max-w-sm mt-2'}>
              Το προφίλ σας μπορεί να προβληθεί μέσα από τα άρθρα που δημοσιεύετε.
            </p>
          </div>
        </div>
        <div className="w-full col-span-3 pb-24">
          {/* Logic: Show spinner ONLY if we are loading AND have no data (prefill or server).
              If we have prefill data, the form shows immediately. 
          */}
          {loading && !initial ? (
            <div className="w-full h-full grid place-items-center">
              <Spinner />
            </div>
          ) : error && !initial ? (
            <div className="bg-[#F00] px-6 py-4 text-white font-medium flex items-center ">
              <WarningIcon size={28} />
              <p className="ml-4">
                {'Σφάλμα: '}
                {error}
              </p>
            </div>
          ) : (
            <>
              <EditForm
                refetch={fetchProfile}
                //@ts-ignore
                initial={initial}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}

function EditForm({ initial, refetch }: { initial: Partial<Profile>; refetch: () => void }) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({
    name: '',
    birtday: '',
    bio: '',
    links: '',
    location: '',
  })

  const [name, setName] = useState(initial.name)
  const [birthday, setBirthday] = useState(initial.birthday)
  const [bio, setBio] = useState(initial.bio)

  const [links, setLinks] = useState<{ link: string; id: string }[]>(
    () =>
      initial.links?.filter(
        (l): l is { link: string; id: string } =>
          typeof l?.link === 'string' && typeof l?.id === 'string',
      ) ?? [],
  )
  const [location, setLocation] = useState<{ id: number; city: string; region: string } | null>(
    () => {
      if (!initial.location) return null
      // Ensure type matching (string vs number)
      const foundCity = cities.find((city) => String(city.id) === String(initial.location))
      return foundCity ?? null
    },
  )
  async function save() {
    // Reset previous errors
    setErrors({
      name: '',
      birtday: '',
      bio: '',
      links: '',
      location: '',
    })

    let hasError = false
    const newErrors = {
      name: '',
      birtday: '',
      bio: '',
      links: '',
      location: '',
    }

    // Name validation - required, not blank after trim
    if (!name || (typeof name === 'string' && name.trim() === '')) {
      newErrors.name = 'req'
      hasError = true
    }

    // Birthday validation - required, must be valid date in YYYY-MM-DD
    if (!birthday || (typeof birthday === 'string' && birthday.trim() === '')) {
      newErrors.birtday = 'req'
      hasError = true
    } else if (typeof birthday === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(birthday.slice(0, 10))) {
      newErrors.birtday = 'Παρακαλώ εισάγετε έγκυρη ημερομηνία (μορφή: ΗΗ-MM-EEEE)'
      hasError = true
    } else {
      // Age validation: user must be between 13 and 23 years old
      const [yearStr, monthStr, dayStr] = birthday.slice(0, 10).split('-')
      const yearNum = Number(yearStr)
      const monthNum = Number(monthStr)
      const dayNum = Number(dayStr)
      const birthDate = new Date(yearNum, monthNum - 1, dayNum)
      if (isNaN(birthDate.getTime())) {
        newErrors.birtday = 'Παρακαλώ εισάγετε έγκυρη ημερομηνία (μορφή: ΗΗ-MM-EEEE)'
        hasError = true
      } else {
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        if (age < 13 || age > 23) {
          newErrors.birtday = 'Πρέπει να είσαι μεταξύ 13 και 23 ετών.'
          hasError = true
        }
      }
    }

    // Links validation - Must be array, all links nonempty string
    if (!Array.isArray(links) || links.some((l) => !l.link || l.link.trim() === '')) {
      newErrors.links = 'Η αφαιρέστε το άδειο link ή συμπληρώστε το.'
      hasError = true
    }

    // Location validation - must be present

    if (hasError) {
      setErrors(newErrors)
      return
    }

    // Helper: compare nullable strings
    function stringEqual(a: string | null | undefined, b: string | null | undefined) {
      return (a ?? '') === (b ?? '')
    }

    // Helper: compare links array deeply, ignoring sort order by id if needed
    function linksEqual(a?: { link: string; id: string }[], b?: { link: string; id: string }[]) {
      if (!a && !b) return true
      if (!a || !b) return false
      if (a.length !== b.length) return false
      // Sort both arrays by id for order-independence
      const sortById = (arr: { link: string; id: string }[]) =>
        [...arr].sort((x, y) => (x.id > y.id ? 1 : x.id < y.id ? -1 : 0))
      const sortedA = sortById(a)
      const sortedB = sortById(b)
      for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i].id !== sortedB[i].id || sortedA[i].link !== sortedB[i].link) {
          return false
        }
      }
      return true
    }

    // Helper: compare birthdays as ISO date strings (YYYY-MM-DD)
    function birthdayEqual(a: string | undefined, b: string | undefined) {
      if (!a && !b) return true
      if (!a || !b) return false
      // Only compare yyyy-mm-dd
      return a.slice(0, 10) === b.slice(0, 10)
    }

    const nameUnchanged = stringEqual(initial.name, name)

    const birthdayUnchanged = birthdayEqual(
      typeof initial.birthday === 'string' ? initial.birthday : undefined,
      typeof birthday === 'string' ? birthday : undefined,
    )

    const locationUnchanged = String(initial.location ?? '') === String(location?.id ?? '')

    const bioUnchanged = stringEqual(initial.bio, bio)

    const linksUnchanged = linksEqual(
      Array.isArray(links) ? links : [],
      Array.isArray(initial.links)
        ? initial.links.filter(
            (l): l is { link: string; id: string } =>
              typeof l?.link === 'string' && typeof l?.id === 'string',
          )
        : [],
    )

    if (nameUnchanged && bioUnchanged && linksUnchanged && birthdayUnchanged && locationUnchanged) {
      toast('Δεν υπάρχει κάτι νέο', {
        description: 'Όλα τα πεδία έχουν παραμείνει ίδια.',
      })
      return 'οκ'
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name ?? '')
      formData.append('birthday', birthday ?? '')
      formData.append('bio', bio ?? '')
      formData.append('location', location?.id?.toString() ?? '')
      formData.append('links', JSON.stringify(links ?? []))

      const req = await fetch('/api/front/account', {
        method: 'PATCH',
        body: formData,
      })
      const res = await req.json()
      if (!req.ok) {
        toast.error(res.error ?? 'Δεν ήταν δυνατή η ενημέρωση του προφίλ σας')
        return
      }
      refetch()
    } catch (error) {
      toast.error('Παρουσιάστηκε άγνωστο σφάλμα', {
        description: 'Έχουμε ειδοποιηθεί. Δοκιμάστε να ανανεώσετε τη σελίδα.',
      })
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className={`flex flex-col relative space-y-10 ${loading && 'pointer-events-none'}`}>
      <div
        className={`absolute z-20 bg-white/20 backdrop-blur-sm inset-0 w-full h-full grid place-items-center pointer-events-none duration-200 ${loading ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="animate-pulse">
          <Logo color="#4E148C" size={64} />
        </div>
      </div>
      <div>
        <p className="pl-3">Όνομα</p>
        <div className="w-full">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="outline-none font-mono w-full border-black/40 px-2 border-b text-lg py-3"
          />
          <FieldError e={errors.name} />
        </div>
      </div>
      <div>
        <p className="pl-3">Γεννέθλια</p>
        <div className="w-full">
          <BirtdayInput value={birthday} setValue={setBirthday} />
          <FieldError e={errors.birtday} />
        </div>
      </div>
      <div>
        <p className="px-3 w-full flex ">
          Βιογραφικό{' '}
          <span className="ml-auto opacity-50 text-sm">
            {bio?.length ? '(' + bio.length + '/300)' : ''}
          </span>
        </p>
        <div className="w-full">
          <textarea
            required
            value={bio ?? ''}
            onChange={(e) =>
              setBio((prev) => (e.target.value.length > 300 ? prev : e.target.value))
            }
            className="outline-none font-mono w-full border-black/40 px-2 border-b text-lg py-3"
          />
          <FieldError e={errors.bio} />
        </div>
      </div>
      <div>
        <div className="px-3 flex">
          <p>Links</p>
          <div className="ml-auto text-sm">
            <button
              disabled={
                !links.every((link) => {
                  const url = link.link?.trim()
                  if (!url) return false
                  try {
                    new URL(url)
                    return true
                  } catch {
                    return false
                  }
                }) || links.length > 2
              }
              onClick={() => {
                setLinks((prev) => [...prev, { id: v1(), link: '' }])
              }}
              className="flex items-center shrink-0 disabled:opacity-25"
            >
              <PlusIcon className="size-3 mr-1" />
              <span className="whitespace-nowrap">Νέο link</span>
            </button>
          </div>
        </div>
        <div className="w-full">
          {links &&
            links.map((i: { link: string; id: string }) => (
              <div className="relative flex  space-x-1.5 w-full" key={i.id}>
                <input
                  key={i.id}
                  className="outline-none font-mono  w-full border-black/40 px-2 border-b text-lg py-3"
                  onKeyDown={(e) => {
                    if (e.code === 'Enter') {
                      if (!links || !links.every((link) => link.link && link.link.trim() !== ''))
                        return
                      setLinks((prev) => [...prev, { id: v1(), link: '' }])
                    }
                  }}
                  placeholder="https://instagram.com/"
                  onChange={(e) => {
                    setLinks((prev) =>
                      prev.map((link: { id: string; link: string }) =>
                        link.id === i.id ? { ...link, link: e.target.value } : link,
                      ),
                    )
                  }}
                  value={i.link ?? ''}
                />
                <button
                  onClick={() => {
                    setLinks((prev) => prev.filter((link) => link.id !== i.id))
                  }}
                >
                  <MinusIcon />
                </button>
              </div>
            ))}
        </div>
        <FieldError e={errors.links} />
      </div>
      <div>
        <p className="pl-3">Τοποθεσία</p>
        <div className="w-full">
          <Location value={location} setValue={setLocation} />
          <FieldError e={errors.location} />
        </div>
      </div>
      <div className="flex mt-8 w-fit space-x-2">
        <button
          disabled={loading}
          onClick={save}
          className="bg-[#4E148C] disabled:opacity-50 text-white px-8 py-2 w-fit font-medium"
        >
          Αποθήκευση
        </button>
      </div>
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
        ref={dayRef}
        onFocus={() => setFocused('day')}
        onChange={(e) => type(e.target.value, 'day')}
        maxLength={2}
        className="outline-none font-mono w-14 border-black/40 px-2 border-b text-lg py-3 text-center"
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
        className="outline-none font-mono w-14 border-black/40 px-2 border-b text-lg py-3 text-center"
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
        className="outline-none font-mono w-18 border-black/40 px-2 border-b text-lg py-3 text-center"
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
function Location({
  value,
  setValue,
}: {
  value: { id: number; city: string; region: string } | null
  setValue: (val: { id: number; city: string; region: string } | null) => void
}) {
  const [query, setQuery] = useState('')

  function stripTones(str: string) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/ς/g, 'σ') // Treat final sigma as sigma for normalization
  }

  const filteredCities =
    query === ''
      ? cities
      : cities.filter((city) => {
          return stripTones(city.city.toLowerCase()).includes(stripTones(query.toLowerCase()))
        })

  return (
    <div className="w-full">
      <Combobox
        value={value}
        onChange={(val) => {
          setValue(val)
        }}
        onClose={() => setQuery('')}
      >
        <div className="relative">
          <ComboboxInput
            className="outline-none font-mono w-full border-black/40 px-2 border-b text-lg py-3"
            // This displays the text in the input after a selection is made
            displayValue={(city: any) => (city ? `${city.city}, ${city.region}` : '')}
            placeholder="Αναζήτηση..."
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            <CaretDownIcon size={16} className="fill-black/60 group-data-hover:fill-black" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor="bottom start"
          transition
          className={clsx(
            'w-(--input-width) z-60 rounded-md border border-black/10 bg-white p-1 shadow-lg',
            'transition duration-100 ease-in data-closed:opacity-0',
          )}
        >
          {filteredCities.length === 0 && query !== '' ? (
            <div className="px-4 py-2 text-sm text-gray-500">Δεν βρέθηκαν αποτελέσματα.</div>
          ) : (
            filteredCities.slice(0, 10).map(
              (
                city, // Slicing for performance if list is huge
              ) => (
                <ComboboxOption
                  key={city.id}
                  value={city}
                  className="group flex cursor-pointer items-center rounded-md px-3 py-2 select-none data-focus:bg-black/5"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-black">{city.city}</span>
                    <span className="text-xs text-black/50">{city.region}, Ελλάδα</span>
                  </div>
                  <CheckIcon className="ml-auto size-4 hidden group-data-selected:block" />
                </ComboboxOption>
              ),
            )
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  )
}
