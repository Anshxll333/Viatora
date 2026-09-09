import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { MemoryEditor } from '@/components/memory-editor'
import { StampVisitSection } from '@/components/stamp-visit-section'
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
  let memoryPhotos: { id: string; url: string }[] = []
  let userStamp = null
  if (user) {
    const [{ data: memory }, { data: stamp }] = await Promise.all([
      supabase
        .from('memories')
        .select('id, content')
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

    if (memory?.id) {
      const { data: photos } = await supabase
        .from('memory_photos')
        .select('id, photo_url')
        .eq('memory_id', memory.id)
      
      if (photos) {
        memoryPhotos = photos.map(p => ({ id: p.id, url: p.photo_url }))
      }
    }
  }

  const isCollected = user ? !!userStamp : false
  const visitedDate = userStamp?.visited_at
    ? new Date(userStamp.visited_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : undefined

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

      {/* Hero stamp & Visit Status action */}
      <StampVisitSection
        destination={destination}
        initialIsCollected={isCollected}
        initialVisitedDate={visitedDate}
        isAuthenticated={!!user}
      />

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
          initialPhotos={memoryPhotos}
          isAuthenticated={!!user}
          destinationId={id}
          destinationName={destination.city}
          destinationCountry={destination.country}
          stampUrl={destination.stamp}
          visitedDate={visitedDate}
        />
      </section>
    </AppShell>
  )
}
