import type { ReactNode } from 'react'

type ScreenHeaderProps = {
  kicker?: string
  title: string
  subtitle?: string
  action?: ReactNode
}

export function ScreenHeader({ kicker, title, subtitle, action }: ScreenHeaderProps) {
  return (
    <header className="px-5 pb-4 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          {kicker && (
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              {kicker}
            </p>
          )}
          <h1 className="text-balance font-serif text-3xl leading-[1.1] text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-[34ch] text-pretty text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  )
}
