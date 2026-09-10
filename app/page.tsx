import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { BrandBar } from '@/components/brand-bar'
import { indiaDestinations, indiaStates } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

export default async function CollectionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let collectedIds = new Set<string>()
  if (user) {
    const { data: stamps } = await supabase
      .from('user_stamps')
      .select('destination_id')
      .eq('user_id', user.id)
    collectedIds = new Set(stamps?.map((s) => s.destination_id) || [])
  }

  const indiaCollected = user
    ? indiaDestinations.filter((d) => collectedIds.has(d.id)).length
    : 0
  const indiaTotal = indiaDestinations.length

  const displayStates = indiaStates.map((state) => {
    const collectedCount = user
      ? state.destinations.filter((d) => collectedIds.has(d.id)).length
      : 0
    return {
      ...state,
      collected: collectedCount,
    }
  })

  return (
    <AppShell>
      <BrandBar />

      <section className="px-5 pb-2 pt-6">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
          MY INDIA
        </p>
        <h1 className="text-balance font-serif text-[2rem] leading-[1.08] text-foreground">
          Explore India by State.
        </h1>
        <p className="mt-2 font-serif text-sm italic text-muted-foreground">
          Every stamp holds a memory permanently inside your passport.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {indiaCollected} of {indiaTotal} India Stamps Collected
          </p>
          <div className="h-px flex-1 bg-border" />
        </div>
      </section>

      <section className="px-5 pt-4">
        <ul className="flex flex-col gap-4">
          {displayStates.map((state) => (
            <li key={state.slug}>
              <Link
                href={`/state/${state.slug}`}
                className="group flex flex-col rounded-2xl border border-border/70 border-l-[3px] border-l-accent/30 bg-card/70 p-4 sm:p-5 shadow-[0_6px_20px_rgba(60,40,20,0.06)] transition-colors hover:border-accent/40 hover:border-l-accent/60"
              >
                <div className="flex flex-row items-center justify-between gap-4 sm:gap-6">
                  <div className="min-w-0 flex-1 py-2">
                    <h2 className="font-serif text-2xl sm:text-3xl leading-tight text-foreground break-words hyphens-auto">
                      {state.name}
                    </h2>
                    <p className="mt-2 font-serif text-xs sm:text-sm italic text-muted-foreground line-clamp-2 sm:line-clamp-none">
                      {state.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 pr-4">
                      <div className="h-px flex-1 bg-accent/20" />
                      <div className="h-1 w-1 rotate-45 bg-accent/30" />
                      <div className="h-px flex-1 bg-accent/20" />
                    </div>
                  </div>
                  {state.artwork ? (
                    <div className="relative h-32 w-20 sm:h-44 sm:w-32 shrink-0 self-center overflow-hidden rounded-[3px] ring-1 ring-black/10 shadow-[0_8px_22px_rgba(60,40,20,0.16)]">
                      <Image
                        src={state.artwork}
                        alt={`${state.name} state artwork`}
                        fill
                        sizes="(max-width: 640px) 80px, 128px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex shrink-0 gap-1.5 self-center">
                      {state.destinations.filter((d) => d.stamp).slice(0, 3).length > 0 ? (
                        state.destinations.filter((d) => d.stamp).slice(0, 3).map((d) => (
                          <div key={d.id} className="relative h-16 w-12 overflow-hidden rounded-[2px] ring-1 ring-black/10 shadow-sm grayscale-[0.7] opacity-70 transition-all duration-300 group-hover:grayscale-[0.4] group-hover:opacity-90">
                            <Image src={d.stamp} alt={d.city} fill sizes="48px" className="object-cover" />
                          </div>
                        ))
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <MapPin className="h-5 w-5" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-dashed border-border/70 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {state.destinations.length} Destinations
                  </p>
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-accent">
                    {state.collected} / {state.destinations.length} Collected
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  )
}
