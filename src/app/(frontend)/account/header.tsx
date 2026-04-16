import { Profile } from '@/payload-types'
import { GearIcon } from '@phosphor-icons/react/ssr'

export default function Header({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center relative bg-[#D1D5DB50] gap-20">
      <div className="w-1/3 aspect-square bg-black shrink-0 relative">
        <button className="p-2 bg-white absolute bottom-5 right-5 border border-black/30">
          <GearIcon color="#000" size={22} />
        </button>
      </div>
      <div className="space-y-4 px-5">
        <h1 className="text-5xl tracking-tight font-medium flex items-center gap-2">
          {profile.name}
        </h1>
        <p className="max-w-xl text-lg leading-tight">{profile.bio}</p>
        <div className="-mb-6 mt-10 text-[16px] opacity-50">
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
  )
}
