import { Profile } from '@/payload-types'
import useSWR, { mutate } from 'swr'

export const PROFILE_KEY = '/api/front/account'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch profile')
    return res.json()
  })

export function useProfile() {
  const { data, error, isLoading, isValidating } = useSWR<Profile>(PROFILE_KEY, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    revalidateIfStale: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000,
  })

  return {
    profile: data,
    isLoading,
    isValidating,
    error,
  }
}

export async function updateProfile(
  updates: Partial<Profile>,
  apiCall: () => Promise<Profile>,
): Promise<Profile> {
  const updated = await mutate<Profile>(
    PROFILE_KEY,

    async (_current: Profile | undefined) => {
      return await apiCall()
    },
    {
      optimisticData: (current: Profile | undefined): Profile =>
        current ? { ...current, ...updates } : (updates as Profile),
      rollbackOnError: true,
      revalidate: true,
      throwOnError: false,
    },
  )

  if (!updated) throw new Error('Update failed')
  return updated
}

export function revalidateProfile() {
  return mutate(PROFILE_KEY)
}
