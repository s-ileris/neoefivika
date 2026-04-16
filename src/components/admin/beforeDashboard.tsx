'use client'

import { SelectInput } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'
import { stringify } from 'qs-esm'

// Custom debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default function BeforeDashboard() {
  const [searchResults, setSearchResults] = React.useState({ docs: [] })
  const [searchTerm, setSearchTerm] = React.useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [loading, setLoading] = useState(false)
  // Effect to trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchDocs(debouncedSearchTerm)
    } else {
      setSearchResults({ docs: [] })
    }
  }, [debouncedSearchTerm]) // Added initialSearchResults to dependencies

  async function searchDocs(search: string) {
    const queryObj = {
      where: {
        or: [
          {
            title: {
              like: search,
            },
          },
          {
            description: {
              like: search,
            },
          },
        ],
      },
    }
    setLoading(true)
    const response = await fetch(`/api/search?${stringify(queryObj)}`)
    const data = await response.json()

    setSearchResults(data)
    setLoading(false)
  }

  return (
    <div>
      <SelectInput
        onInputChange={(value) => {
          setSearchTerm(value)
        }}
        onChange={(value: any) => {
          // Open new tab with participant
          window.open(`/admin/collections/search/${value.value}`, '_blank')
        }}
        options={searchResults.docs.map((res: any) => ({
          label: `${res.title} - ${res.description} | ${res.doc.relationTo}`,
          value: res.id,
        }))}
        className=""
        label=""
        name="search"
        path="search"
      />
      {loading && 'loading'}
    </div>
  )
}
