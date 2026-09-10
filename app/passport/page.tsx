import { Globe } from 'lucide-react'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { ScreenHeader } from '@/components/screen-header'
import { Stamp } from '@/components/stamp'
import { passportStats, visitedDestinations, destinations } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

const stats = [
  { label: 'Stamps', value: passportStats.stamps },
  { label: 'States', value: passportStats.states },
  { label: 'Destinations', value: passportStats.cities },
  { label: 'Memories', value: passportStats.memories },
  { label: 'Countries', value: passportStats.countries },
]

export default async function PassportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  let profile = null
  let userStamps: { destination_id: string; visited_at: string | null }[] = []
  let userMemoriesCount = 0

  if (user) {
    const [
      { data: profileData },
      { data: stamps },
      { count: memoriesCount }
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      supabase
        .from('user_stamps')
        .select('destination_id, visited_at')
        .eq('user_id', user.id),
      supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
    ])

    profile = profileData
    userStamps = stamps || []
    userMemoriesCount = memoriesCount || 0
  }

  const bearerName = profile?.username
  const passportNo = profile?.passport_number
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : ''

  // Calculate real stats if authenticated
  const realVisitedDestinations = user
    ? destinations.filter((d) => userStamps.some((s) => s.destination_id === d.id))
    : visitedDestinations

  const realStates = user
    ? new Set(realVisitedDestinations.map((d) => d.state).filter(Boolean)).size
    : passportStats.states

  const realCountries = user
    ? new Set(realVisitedDestinations.map((d) => d.country).filter(Boolean)).size
    : passportStats.countries

  const displayStats = user
    ? [
        { label: 'Stamps', value: userStamps.length },
        { label: 'States', value: realStates },
        { label: 'Destinations', value: userStamps.length },
        { label: 'Memories', value: userMemoriesCount },
        { label: 'Countries', value: realCountries },
      ]
    : stats

  const displayDestinations = user
    ? destinations.map((d) => {
        const stamp = userStamps.find((s) => s.destination_id === d.id)
        return {
          ...d,
          visited: !!stamp,
          dateVisited: stamp?.visited_at
            ? new Date(stamp.visited_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })
            : undefined,
        }
      })
    : destinations

  return (
    <AppShell>
      <ScreenHeader kicker="My Passport" title="Your journey, in one book." />

      {/* Passport cover / identity card */}
      <section className="px-5">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-[0_16px_40px_rgba(30,45,35,0.35)]">
          <div
            aria-hidden="true"
            className="paper-texture pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                Travel Passport
              </p>
              <Globe className="h-5 w-5 text-gold" aria-hidden="true" />
            </div>

            <p className="mt-8 font-serif text-3xl tracking-[0.12em] text-gold">
              VIATORA
            </p>

            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary-foreground/60">
                  Bearer
                </p>
                <p className="font-serif text-xl leading-tight">{bearerName}</p>
                <p className="mt-0.5 text-xs text-primary-foreground/70">
                  Citizen of the World
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary-foreground/60">
                  Passport No.
                </p>
                <p className="font-mono text-xs tracking-wider">
                  {passportNo}
                </p>
                <p className="mt-1 font-mono text-[10px] text-primary-foreground/60">
                  Member since {memberSince}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="px-5 pt-8">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            The Numbers
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {displayStats.map((stat, i) => (
            <div
              key={stat.label}
              className={
                'rounded-xl border border-border/70 bg-card/70 p-4 ' +
                (i === 0 ? 'col-span-1' : '')
              }
            >
              <p className="font-serif text-4xl leading-none text-foreground">
                {stat.value}
              </p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Visa pages — stamp wall */}
      <section className="px-5 pt-8">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Stamps Collected
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-5">
          <div className="grid grid-cols-4 gap-3">
            {displayDestinations
              .filter((d) => d.visited)
              .map((d, i) => (
                <div key={d.id} className={i % 2 === 0 ? 'rotate-[-3deg]' : 'rotate-[3deg]'}>
                  <Stamp destination={d} showCaption={false} />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Passport log */}
      <section className="px-5 pt-8">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Entry Log
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <ul className="divide-y divide-border/70 rounded-2xl border border-border/70 bg-card/60">
          {displayDestinations.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-accent">
                  {d.countryCode}
                </span>
                <div>
                  <p className="font-serif text-base leading-none text-foreground">
                    {d.city}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {d.country}
                  </p>
                </div>
              </div>
              <span
                className={
                  'font-mono text-[10px] uppercase tracking-[0.14em] ' +
                  (d.visited ? 'text-foreground/70' : 'text-muted-foreground/50')
                }
              >
                {d.visited ? d.dateVisited : 'Not yet'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  )
}
