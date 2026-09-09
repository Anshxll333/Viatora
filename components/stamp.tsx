import Link from 'next/link'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Destination } from '@/lib/data'

type StampProps = {
  destination: Destination
  size?: 'sm' | 'lg'
  showCaption?: boolean
  interactive?: boolean
  className?: string
  priority?: boolean
}

function StampFace({
  destination,
  size = 'sm',
  showCaption = true,
  priority,
}: Omit<StampProps, 'interactive' | 'className'>) {
  const { visited } = destination

  return (
    <div
      className={cn(
        'stamp-perf drop-shadow-[0_10px_20px_rgba(60,40,20,0.16)] transition-transform duration-300',
        size === 'lg' && 'stamp-perf-lg',
      )}
    >
      <div className="relative overflow-hidden rounded-[2px] ring-1 ring-black/10">
        {/* Illustration */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
          {destination.stamp ? (
            <img
              src={destination.stamp}
              alt={`Illustrated ${destination.city} stamp`}
              loading={priority ? 'eager' : 'lazy'}
              className={cn(
                'h-full w-full object-cover object-center',
                !visited && 'grayscale-[0.9] opacity-55 contrast-[0.95]',
              )}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/60 px-3 text-center text-muted-foreground">
              <Lock className="h-5 w-5" aria-hidden="true" />
              <span className="font-mono text-[9px] uppercase tracking-[0.14em]">Artwork pending</span>
            </div>
          )}

          {/* Cancelled postmark on visited stamps */}
          {visited && (
            <div className="pointer-events-none absolute right-2 top-2 flex h-11 w-11 rotate-[-14deg] items-center justify-center rounded-full postmark">
              <span className="font-mono text-[8px] font-semibold uppercase leading-none tracking-tight">
                {destination.countryCode}
              </span>
            </div>
          )}

          {/* Locked overlay */}
          {!visited && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-stamp-paper/25">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stamp-paper/90 text-muted-foreground shadow-sm ring-1 ring-black/5">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          )}
        </div>

        {/* Caption strip */}
        {showCaption && (
          <div className="flex items-end justify-between gap-2 border-t border-dashed border-foreground/15 bg-stamp-paper px-2.5 py-2">
            <div className="min-w-0">
              <p
                className={cn(
                  'truncate font-serif leading-tight text-foreground',
                  size === 'lg' ? 'text-lg' : 'text-[15px]',
                )}
              >
                {destination.city}
              </p>
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {destination.country}
              </p>
            </div>
            <span
              className={cn(
                'shrink-0 font-serif italic',
                size === 'lg' ? 'text-base' : 'text-xs',
                visited ? 'text-accent' : 'text-muted-foreground/60',
              )}
            >
              {visited ? 'VIA' : '—'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function Stamp({
  destination,
  size = 'sm',
  showCaption = true,
  interactive = true,
  className,
  priority,
}: StampProps) {
  const face = (
    <StampFace
      destination={destination}
      size={size}
      showCaption={showCaption}
      priority={priority}
    />
  )

  if (interactive) {
    return (
      <Link
        href={`/stamp/${destination.id}`}
        aria-label={`Open ${destination.city} stamp detail`}
        className={cn(
          'group block rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_.stamp-perf]:hover:-translate-y-1 [&_.stamp-perf]:hover:rotate-[-1deg]',
          className,
        )}
      >
        {face}
      </Link>
    )
  }

  return (
    <div
      className={cn('block', className)}
      aria-label={`${destination.city} stamp`}
    >
      {face}
    </div>
  )
}
