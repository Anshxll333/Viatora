import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle2, Lock, Navigation } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Stamp } from '@/components/stamp'
import { MemoryEditor } from '@/components/memory-editor'
import { destinations, getDestination } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

export function generateStaticParams() {
  return destinations.map((d) => ({ id: d.id }))
}

export default async function StampDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const destination = getDestination(id)

  if (!destination) {
    notFound()
  }

  // Check server-side authentication state
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Load per-user collection and memory from DB.
  let memoryContent = ''
  let userStamp = null
  if (user) {
    const [{ data: memory }, { data: stamp }] = await Promise.all([
      supabase
        .from('memories')
        .select('content')
        .eq('user_id', user.id)
        .eq('destination_id', id)
        .maybeSingle(),
      supabase
        .from('user_stamps')
        .select('visited_at')
        .eq('user_id', user.id)
        .eq('destination_id', id)
        .maybeSingle(),
    ])
    memoryContent = memory?.content ?? ''
    userStamp = stamp
  }

  const isCollected = user ? !!userStamp : destination.visited
  const visitedDate = userStamp?.visited_at
    ? new Date(userStamp.visited_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : destination.dateVisited

  const locationSubhead = destination.state
    ? `${destination.state}, ${destination.country}`
    : destination.country

  return (
    <AppShell>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <Link
          href={destination.state ? `/state/${destination.state.toLowerCase().replace(/\s+/g, '-')}` : '/'}
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {destination.state ? 'BACK TO STATES' : 'Collection'}
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          {destination.countryCode} {destination.state ? `· ${destination.state}` : ''}
        </span>
      </div>

      {/* Hero stamp */}
      <section className="flex flex-col items-center px-5 pt-2">
        <div className="w-44 rotate-[-2deg]">
          <Stamp
            destination={destination}
            size="lg"
            interactive={false}
            priority
          />
        </div>

        <h1 className="mt-7 text-center font-serif text-4xl leading-none text-foreground">
          {destination.city}
        </h1>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {locationSubhead}
          </span>
          {visitedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {visitedDate}
            </span>
          )}
          {destination.tripDays && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {destination.tripDays} days
            </span>
          )}
        </div>

        <p className="mt-5 max-w-[42ch] text-balance text-center font-serif text-lg italic leading-relaxed text-foreground/80">
          {destination.description}
        </p>

        {/* Visit Status Badge & Prototype Action */}
        <div className="mt-6 w-full max-w-sm rounded-2xl border border-border/70 bg-card/60 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Visit Status
          </p>

          {isCollected ? (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-accent">
              <CheckCircle2 className="h-4 w-4" />
              Collected {visitedDate ? `· ${visitedDate}` : ''}
            </div>
          ) : (
            <div className="mt-2 flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1.5 font-mono text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Not Collected Yet
              </div>

              <div className="mt-2 rounded-xl border border-dashed border-accent/30 bg-accent/5 p-3 text-center">
                <p className="text-[11px] italic leading-snug text-muted-foreground">
                  Prototype behavior: GPS location verification is coming soon.
                </p>
                {user ? (
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-foreground shadow-sm hover:opacity-90"
                  >
                    <Navigation className="h-3 w-3" />
                    Mark as Visited (Prototype)
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-foreground shadow-sm hover:opacity-90"
                  >
                    Sign In / Create Passport to Collect
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Photos */}
      {destination.photos.length > 0 && (
        <section className="mt-9">
          <div className="mb-3 flex items-center gap-3 px-5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              From the trip
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {destination.photos.map((photo, i) => (
              <div
                key={photo}
                className="relative shrink-0 rotate-[-1deg] rounded-sm border-[6px] border-card bg-card p-0 shadow-[0_8px_22px_rgba(60,40,20,0.16)] odd:rotate-[1.5deg]"
              >
                <img
                  src={photo || '/placeholder.svg'}
                  alt={`${destination.city} trip photo ${i + 1}`}
                  className="h-56 w-44 rounded-[1px] object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Memory */}
      <section className="mt-9 px-5">
        <MemoryEditor
          initial={memoryContent}
          isAuthenticated={!!user}
          destinationId={id}
        />
      </section>
    </AppShell>
  )
}
