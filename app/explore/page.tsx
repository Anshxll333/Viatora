import Link from 'next/link'
import { MapPin, Sparkles, PenLine, Navigation, ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ScreenHeader } from '@/components/screen-header'
import { Stamp } from '@/components/stamp'
import { destinations } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

const steps = [
  { icon: Navigation, title: 'Arrive', text: 'Reach a new place in India.' },
  { icon: Sparkles, title: 'Collect', text: 'Its stamp appears in your passport.' },
  { icon: PenLine, title: 'Remember', text: 'Write down how the journey felt.' },
]

// State metadata mapping for extensible future states
const stateMeta: Record<string, { tag: string; description: string }> = {
  Uttarakhand: {
    tag: 'UTTARAKHAND',
    description: 'Himalayas, rivers & mountain journeys',
  },
  Rajasthan: {
    tag: 'RAJASTHAN',
    description: 'Forts, deserts & royal cities',
  },
}

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userStamps = new Set<string>()
  if (user) {
    const { data } = await supabase
      .from('user_stamps')
      .select('destination_id')
      .eq('user_id', user.id)
    userStamps = new Set(data?.map(s => s.destination_id) || [])
  }

  const indiaDests = destinations.filter((d) => d.country === 'India').map(d => ({
    ...d,
    visited: user ? userStamps.has(d.id) : false
  }))

  // Group India destinations dynamically by state
  const stateGroups = indiaDests.reduce((acc, dest) => {
    const st = dest.state || 'Other'
    if (!acc[st]) acc[st] = []
    acc[st].push(dest)
    return acc
  }, {} as Record<string, typeof indiaDests>)

  return (
    <AppShell>
      <ScreenHeader
        kicker="EXPLORE INDIA"
        title="Collect places, not just souvenirs."
        subtitle="Discover sacred river towns, mountain sanctuaries, and ancient royal citadels."
      />

      {/* How it works */}
      <section className="px-5">
        <ol className="grid grid-cols-3 gap-3">
          {steps.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="rounded-xl border border-border/70 bg-card/70 p-3 text-center"
            >
              <span className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <p className="font-serif text-sm font-semibold leading-none text-foreground">
                {title}
              </p>
              <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                {text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Location hint */}
      <section className="px-5 pt-5">
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-accent/40 bg-accent/5 px-4 py-3">
          <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-[11px] leading-snug text-foreground/80">
            <span className="font-medium">GPS location verification coming soon.</span>{' '}
            Explore any destination below to view details and mark your visit prototype.
          </p>
        </div>
      </section>

      {/* Dynamic State Sections (Uttarakhand, Rajasthan, etc.) */}
      {Object.entries(stateGroups).map(([stateName, stateDests]) => {
        const meta = stateMeta[stateName] || {
          tag: stateName.toUpperCase(),
          description: `Destinations across ${stateName}`,
        }

        return (
          <section key={stateName} className="px-5 pt-8">
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent font-semibold">
                  {meta.tag}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <p className="mt-1 font-serif text-sm italic text-muted-foreground">
                {meta.description}
              </p>
            </div>

            <ul className="grid grid-cols-2 gap-x-5 gap-y-7">
              {stateDests.map((destination) => (
                <li key={destination.id} className="flex flex-col">
                  <Stamp destination={destination} />
                  <div className="mt-2 text-center">
                    <p className="font-serif text-sm leading-tight text-foreground font-medium">
                      {destination.city}
                    </p>
                    <span
                      className={`inline-block mt-1 font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ${
                        destination.visited
                          ? 'bg-accent/15 text-accent font-semibold'
                          : 'bg-muted/40 text-muted-foreground/80'
                      }`}
                    >
                      {destination.visited ? 'Collected ✓' : 'Locked'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {/* Extensible Future Note */}
      <section className="px-5 pt-10 pb-4 text-center">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <p className="font-serif text-xs italic text-muted-foreground">
            More Indian states coming soon — Himachal Pradesh, Goa, Kerala, Maharashtra, Gujarat, Tamil Nadu, and West Bengal.
          </p>
        </div>
      </section>
    </AppShell>
  )
}
