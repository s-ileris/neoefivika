import Link from 'next/link'

export default async function Page() {
  return (
    <div className="w-full h-screen grid place-items-center p-5 bg-[#D1D5DB50]">
      <div className="min-w-sm shadow max-w-md w-full bg-white p-6 border">
        <h1 className="text-2xl font-medium leading-tight mb-3">Το κείμενο αναμένει έγγριση</h1>
        <p>
          Η ομάδα μας θα διαβάσει σύντομα το κείμενο και θα το δημοσιοποιήσει ή θα το απορρίψει αν
          το θεωρήσει ακατάλληλο για δημοσίευση βάση τον κανόνων του Νέοεφηβικά.
        </p>
        <div className="flex ml-auto mt-6 w-fit space-x-2">
          <Link
            href={'/articles'}
            className="bg-[#4E148C] border-[#4E148C] border text-white px-8 py-2 w-fit font-medium"
          >
            Επιστροφή
          </Link>
        </div>
      </div>
    </div>
  )
}
