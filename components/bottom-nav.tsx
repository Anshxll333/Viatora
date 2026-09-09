'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Stamp, Compass, BookOpen, BookMarked, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'Collection', icon: Stamp },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/passport', label: 'Passport', icon: BookMarked },
  { href: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center"
    >
      <div className="pointer-events-auto mb-3 w-[calc(100%-1.5rem)] max-w-md">
        <ul className="flex items-stretch justify-between gap-1 rounded-2xl border border-border/80 bg-card/90 px-2 py-2 shadow-[0_8px_30px_rgba(60,40,20,0.14)] backdrop-blur-md">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors',
                    active
                      ? 'text-accent'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                      active && 'bg-accent/10',
                    )}
                  >
                    <Icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={active ? 2.2 : 1.7}
                      aria-hidden="true"
                    />
                  </span>
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
