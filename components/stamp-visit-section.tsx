'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, CheckCircle2, Clock, Lock, MapPin, Navigation } from 'lucide-react'
import { Stamp } from '@/components/stamp'
import { createClient } from '@/lib/supabase/client'
import type { Destination } from '@/lib/data'

interface StampVisitSectionProps {
  destination: Destination
  initialIsCollected: boolean
  initialVisitedDate?: string
  isAuthenticated: boolean
}

export function StampVisitSection({
  destination,
  initialIsCollected,
  initialVisitedDate,
  isAuthenticated,
}: StampVisitSectionProps) {
  const router = useRouter()
  const [isCollected, setIsCollected] = useState(initialIsCollected)
  const [visitedDate, setVisitedDate] = useState<string | undefined>(initialVisitedDate)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const locationSubhead = destination.state
    ? `${destination.state}, ${destination.country}`
    : destination.country

  const handleMarkAsVisited = async () => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth')
        return
      }

      const now = new Date()
      const visitedAtIso = now.toISOString()
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })

      const { error } = await supabase.from('user_stamps').upsert(
        {
          user_id: user.id,
          destination_id: destination.id,
          visited_at: visitedAtIso,
        },
        { onConflict: 'user_id, destination_id' }
      )

      if (error) {
        console.error('Supabase user_stamps insert error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }

      setIsCollected(true)
      setVisitedDate(formattedDate)
      router.refresh()
    } catch (err: any) {
      console.error('Failed to mark destination as visited:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        error: err,
      })
      setErrorMsg(`Could not update stamp status. ${err?.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-col items-center px-5 pt-2">
      {/* Hero stamp */}
      <div className="w-44 rotate-[-2deg]">
        <Stamp
          destination={{ ...destination, visited: isCollected }}
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

      {/* Visit Status Badge & Action */}
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
                GPS location verification coming soon.
              </p>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleMarkAsVisited}
                  disabled={loading}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  <Navigation className="h-3 w-3" />
                  {loading ? 'Saving...' : 'MARK AS VISITED'}
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-foreground shadow-sm hover:opacity-90"
                >
                  Sign In / Create Passport to Collect
                </Link>
              )}

              {errorMsg && (
                <p className="mt-2 text-[10px] text-destructive">{errorMsg}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
