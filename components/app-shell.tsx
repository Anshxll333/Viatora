import type { ReactNode } from 'react'
import { BottomNav } from '@/components/bottom-nav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full">
      {/* Vintage paper grain overlay */}
      <div
        aria-hidden="true"
        className="paper-texture pointer-events-none fixed inset-0 z-0 opacity-[0.5] mix-blend-multiply"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background/40 shadow-[0_0_80px_rgba(60,40,20,0.08)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-3xl md:border md:border-border/70 md:bg-background/60 md:shadow-[0_20px_60px_rgba(60,40,20,0.15)]">
        <main className="flex-1 pb-28">{children}</main>
      </div>

      <BottomNav />
    </div>
  )
}
