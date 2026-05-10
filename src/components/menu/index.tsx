'use client'
import Logo from '../logo'
import Search from '@/components/icons/search'
import { links } from './data'
import Link from 'next/link'
import Account from '../icons/account'
import { Show } from '@clerk/nextjs'

export default function Menu() {
  return (
    <div className="fixed px-5 py-3 z-50 top-0 left-0 w-full h-fit flex items-center bg-white border-black/60">
      <div className="flex-1 flex items-center space-x-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="font-medium">
            {link.title}
          </Link>
        ))}
      </div>
      <Link href={'/'} className="flex-1 flex justify-center">
        <Logo size={40} className="h-auto" color="#4E148C" />
      </Link>
      <div className="flex-1 flex justify-end items-center space-x-3">
        <button
          className="flex items-center justify-center"
          type="button"
          aria-label="Search"
          tabIndex={0}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <Search size={26} />
        </button>
        <Show when="signed-out">
          <Link href={'/login'}>
            <Account size={26} />
          </Link>
        </Show>
        <Show when="signed-in">
          <Link prefetch href={'/account'}>
            <Account size={26} />
          </Link>
        </Show>
      </div>
    </div>
  )
}
