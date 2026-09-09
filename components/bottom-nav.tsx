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
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[env(safe-area-inset-bottom,0.75rem)]"
    >
      <div className="pointer-events-auto mb-2 w-[calc(100%-1rem)] max-w-md px-1">
        <ul className="flex items-stretch justify-between gap-0.5 rounded-2xl border border-border/80 bg-card/90 px-1.5 py-1.5 shadow-[0_8px_30px_rgba(60,40,20,0.14)] backdrop-blur-md">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href} className="flex-1 min-w-0">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl px-0 py-1 text-[8.5px] sm:text-[10px] font-medium uppercase tracking-[0.05em] transition-colors',
                    active
                      ? 'text-accent font-semibold'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg transition-colors',
                      active && 'bg-accent/10',
                    )}
                  >
                    <Icon
                      className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                      strokeWidth={active ? 2.2 : 1.7}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="w-full truncate text-center">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
