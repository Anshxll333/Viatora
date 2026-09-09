import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ScreenHeader } from '@/components/screen-header'
import { Stamp } from '@/components/stamp'
import { destinations, journalEntries } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let entries = journalEntries
  if (user) {
    const { data: memories } = await supabase
      .from('memories')
      .select('id, destination_id, content, visited_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (memories && memories.length > 0) {
      const memoryIds = memories.map(m => m.id)
      const { data: photos } = await supabase
        .from('memory_photos')
        .select('memory_id, photo_url')
        .in('memory_id', memoryIds)

      entries = memories.flatMap((memory) => {
        const destination = destinations.find((d) => d.id === memory.destination_id)
        if (!destination) return []
        
        const memoryPhotos = photos
          ?.filter(p => p.memory_id === memory.id)
          .map(p => p.photo_url) || []

        return [{
          ...destination,
          visited: true,
          memory: memory.content || '',
          dateVisited: memory.visited_at || memory.updated_at,
          photos: memoryPhotos,
        }]
      })
    } else {
      entries = []
    }
  }
  return (
    <AppShell>
      <ScreenHeader
        kicker="Travel Journal"
        title="Stories, kept."
        subtitle="Every place leaves a little of itself behind. These are the ones worth remembering."
      />

      <section className="px-5">
        <ol className="relative space-y-8 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border">
          {entries.map((entry) => (
            <li key={entry.id} className="relative pl-8">
              {/* Timeline node */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 border-accent bg-background"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </span>

              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {entry.dateVisited}
              </p>

              <Link
                href={`/stamp/${entry.id}`}
                className="group block rounded-2xl border border-border/70 bg-card/70 p-4 shadow-[0_6px_20px_rgba(60,40,20,0.06)] transition-colors hover:border-accent/40"
              >
                <div className="flex gap-4">
                  <div className="w-[76px] shrink-0">
                    <Stamp
                      destination={entry}
                      showCaption={false}
                      interactive={false}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-serif text-xl leading-none text-foreground">
                          {entry.city}
                        </h2>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {entry.state ? `${entry.state}, ${entry.country}` : entry.country}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent"
                        aria-hidden="true"
                      />
                    </div>

                    <div
                      className="mt-2.5 line-clamp-3 font-serif text-[14px] italic leading-relaxed text-foreground/80 [&_span]:!text-[14px]"
                      dangerouslySetInnerHTML={{ __html: entry.memory || '' }}
                    />
                  </div>
                </div>

                {/* Photo strip */}
                {entry.photos.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {entry.photos.map((photo, i) => (
                      <img
                        key={photo}
                        src={photo || '/placeholder.svg'}
                        alt={`${entry.city} photo ${i + 1}`}
                        className="h-16 w-16 rounded-md border border-card object-cover shadow-sm"
                      />
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  )
}
