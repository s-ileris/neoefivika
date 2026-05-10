// 'use client'
// import { Search } from '@upstash/search'

// const client = new Search({
//   url: process.env.NEXT_PUBLIC_UPSTASH_SEARCH_URL!,
//   token: process.env.NEXT_PUBLIC_UPSTASH_SEARCH_READ_TOKEN!,
// })

// const index = client.index<{ title: string }>('articles')

// export default function SearchComponent() {
//   return (
//     <div className="max-w-sm mt-24 mx-auto">
//       <SearchBar.Dialog>
//         <SearchBar.DialogTrigger placeholder="Search..." />

//         <SearchBar.DialogContent>
//           <SearchBar.Input placeholder="Type to search..." />
//           <SearchBar.Results
//             searchFn={(query) => {
//               // 👇 100% type-safe: whatever you return here is
//               // automatically typed as `result` below
//               return index.search({ query, limit: 10, reranking: true })
//             }}
//           >
//             {(result) => (
//               <div
//                 key={result.id}
//                 onClick={() => {
//                   window.open(result.metadata?.url as string, '_blank')
//                 }}
//               >
//                 <SearchBar.Result
//                   value={result.id}
//                   className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
//                 >
//                   <SearchBar.ResultIcon>
//                     <FileText className="text-gray-600" />
//                   </SearchBar.ResultIcon>

//                   <SearchBar.ResultContent>
//                     <SearchBar.ResultTitle>{result.content.title}</SearchBar.ResultTitle>
//                     <p className="text-xs text-gray-500 mt-0.5">Docs</p>
//                   </SearchBar.ResultContent>
//                 </SearchBar.Result>
//               </div>
//             )}
//           </SearchBar.Results>
//         </SearchBar.DialogContent>
//       </SearchBar.Dialog>
//     </div>
//   )
// }
