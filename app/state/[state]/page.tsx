import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Stamp } from '@/components/stamp'
import { indiaDestinations } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

export function generateStaticParams() {
  const states = new Set(indiaDestinations.map((d) => d.state).filter(Boolean))
  return Array.from(states).map((state) => ({
    state: state!.toLowerCase().replace(/\s+/g, '-'),
  }))
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>
}) {
  const { state: stateSlug } = await params
  
  const stateDestinations = indiaDestinations.filter(
    (d) => d.state?.toLowerCase().replace(/\s+/g, '-') === stateSlug
  )

  if (stateDestinations.length === 0) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let collectedIds = new Set<string>()
  if (user) {
    const { data: stamps } = await supabase
      .from('user_stamps')
      .select('destination_id')
      .eq('user_id', user.id)
    collectedIds = new Set(stamps?.map(s => s.destination_id) || [])
  }

  const stateName = stateDestinations[0].state!
  const collected = user
    ? stateDestinations.filter((d) => collectedIds.has(d.id)).length
    : 0
  const total = stateDestinations.length

  return (
    <AppShell>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          BACK TO STATES
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          {stateName}
        </span>
      </div>

      <section className="px-5 pb-2 pt-2">
        <h1 className="text-balance font-serif text-[2rem] leading-[1.08] text-foreground">
          {stateName}
        </h1>
        
        {/* Progress bar */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
            {collected} of {total} Stamps Collected
          </p>
          <div className="h-px flex-1 bg-border" />
        </div>
      </section>

      <section className="px-5 pt-4">
        <ul className="grid grid-cols-2 gap-x-5 gap-y-7">
          {stateDestinations.map((destination, i) => {
            const isCollected = user
              ? collectedIds.has(destination.id)
              : false
            return (
            <li key={destination.id} className="flex flex-col">
              <Stamp destination={{ ...destination, visited: isCollected }} priority={i < 4} />
              <div className="mt-2 text-center">
                <span
                  className={`inline-block mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full ${
                    isCollected
                      ? 'bg-accent/15 text-accent font-semibold'
                      : 'bg-muted/40 text-muted-foreground/70'
                  }`}
                >
                  {isCollected ? 'COLLECTED ✓' : 'NOT COLLECTED'}
                </span>
              </div>
            </li>
            )
          })}
        </ul>

        <p className="mt-10 text-center font-serif text-sm italic text-muted-foreground">
          Travel far. Keep it forever.
        </p>
      </section>
    </AppShell>
  )
}
