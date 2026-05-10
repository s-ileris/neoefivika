'use client'
import { useClerk } from '@clerk/nextjs'
import { SignOutIcon } from '@phosphor-icons/react'

export default function Logout() {
  const { signOut } = useClerk()
  return (
    <button
      onClick={() => signOut()}
      type="submit"
      className="bg-[#D1D5DB50] border-black/10 border items-center text-black flex px-6 py-2 font-medium text-sm w-fit space-x-2"
    >
      <SignOutIcon size={16} weight="bold" color="black" />
      <span>Αποσύνδεση</span>
    </button>
  )
}
