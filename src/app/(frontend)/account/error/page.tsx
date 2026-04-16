import Link from 'next/link'

export default async function Page() {
  return (
    <div className="w-full h-screen grid place-items-center p-5 bg-[#D1D5DB50]">
      <div className="min-w-sm max-w-md w-full bg-white p-6 border">
        <h1 className="text-2xl font-medium leading-tight mb-3">Παρακαλώ περιμένετε</h1>
        <p>
          Δώστε μας λίγα λεπτά να ρυθμίσουμε το προφίλ σας και ξαναπροσπαθήστε. Εάν το σφάλμα
          παραμείνει για πάνω από 5 λεπτά επικοινωνήστε με την υποστήριξη.
        </p>
        <div className="flex ml-auto mt-6 w-fit space-x-2">
          <Link href={'/help'} className="border border-black/20 px-8 py-2 w-fit font-medium">
            Βοήθεια
          </Link>
          <Link
            href={'/account'}
            className="bg-[#4E148C] border-[#4E148C] border text-white px-8 py-2 w-fit font-medium"
          >
            Επαναφόρτωση
          </Link>
        </div>
      </div>
    </div>
  )
}
