// 'use server'
// import getPayload from '@/lib/payload'
// import { currentUser } from '@clerk/nextjs/server'
// import Link from 'next/link'
// import { redirect } from 'next/navigation'
// import { Suspense } from 'react'

// export default async function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   const user = await currentUser()
//   if (!user?.id) return
//   const payload = await getPayload()
//   const profile = await payload
//     .findByID({
//       collection: 'profiles',
//       id: user.id,
//       select: {
//         birthday: true,
//       },
//     })
//     .catch((e: Error) => {
//       console.error(e)
//     })

//   if (!profile) {
//     redirect('/account/wait')
//   }
//   return (
//     <div className="min-h-screen">
//       <Suspense>{children}</Suspense>
//       {!profile.birthday && (
//         <div className="fixed z-40 top-0 left-0 w-full h-dvh p-5 bg-black/10 backdrop-blur-md grid place-items-center">
//           <div className="min-w-sm shadow max-w-md w-full bg-white p-6 border">
//             <h1 className="text-2xl font-medium leading-tight mb-3"> Ημερομηνία γέννησης</h1>
//             <p>
//               Για να διασφαλίσουμε πρόσβαση στην πλατφόρμα μόνο σε άτομα 13 με 23 ετών παρακαλούμε
//               συμπλήρωσε την ημερομηνία γέννησής σου στο προφιλ.
//             </p>
//             <div className="flex ml-auto mt-6 w-fit space-x-2">
//               <Link
//                 href={'/account/edit'}
//                 className="bg-[#4E148C] border-[#4E148C] border text-white px-8 py-2 w-fit font-medium"
//               >
//                 Εντάξει
//               </Link>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
