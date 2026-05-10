import { Profile } from '@/payload-types'
import Uploader from './uploader'
import Link from 'next/link'
import { PencilSimpleIcon } from '@phosphor-icons/react/ssr'

export default function Header({ profile }: { profile: Profile }) {
  return (
    <>
      <div className="flex max-sm:flex-col max-sm:pb-14 items-center relative sm:bg-[#D1D5DB50] gap-20 max-sm:gap-8">
        <Link
          href={'/account/edit'}
          className="p-2 z-20 border bg-white aspect-square absolute bottom-5 right-5 border-black/10"
        >
          <PencilSimpleIcon size={16} />
        </Link>
        <div className="w-1/3 max-sm:w-5/6 max-sm:mr-auto aspect-square shrink-0 relative">
          <div className="absolute inset-0">
            {/* @ts-ignore */}
            <Uploader initial={profile.profile} />
          </div>
        </div>
        <div className="space-y-4 max-sm:space-y-2 px-5 flex flex-col">
          <h1 className="text-5xl max-sm:text-4xl tracking-tight font-medium">{profile.name}</h1>
          <p className="max-w-xl text-lg max-sm:text-base leading-tight">{profile.bio}</p>
          <div className="sm:-mb-6 text-[16px] max-sm:text-sm opacity-50">
            <p>{profile.email}</p>
            <p>
              Μέλος από{' '}
              {(() => {
                const greekMonths = [
                  'Ιανουάριος',
                  'Φεβρουάριος',
                  'Μάρτιος',
                  'Απρίλιος',
                  'Μάιος',
                  'Ιούνιος',
                  'Ιούλιος',
                  'Αύγουστος',
                  'Σεπτέμβριος',
                  'Οκτώβριος',
                  'Νοέμβριος',
                  'Δεκέμβριος',
                ]
                const date = profile.createdAt ? new Date(profile.createdAt) : null
                return date ? `${greekMonths[date.getMonth()]} ${date.getFullYear()}` : ''
              })()}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
