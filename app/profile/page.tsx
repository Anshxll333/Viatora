import Link from 'next/link'
import { User, Mail, Compass, LogOut, ShieldCheck, MapPin, Stamp as StampIcon, Bookmark, Settings, Award } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ScreenHeader } from '@/components/screen-header'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import { destinations, passportStats } from '@/lib/data'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch profile row if user is authenticated
  let profile = null
  let collectedCount = destinations.filter((d) => d.visited).length
  let statesVisitedCount = passportStats.states
  let memoriesCount = passportStats.memories

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data

    const { data: stamps } = await supabase
      .from('user_stamps')
      .select('destination_id')
      .eq('user_id', user.id)
    
    collectedCount = stamps?.length || 0
    
    const visitedDestIds = new Set(stamps?.map(s => s.destination_id) || [])
    const visitedDests = destinations.filter(d => visitedDestIds.has(d.id))
    statesVisitedCount = new Set(visitedDests.map(d => d.state).filter(Boolean)).size

    const { count } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    memoriesCount = count || 0
  }

  return (
    <AppShell>
      <ScreenHeader kicker="Travel Profile" title="Traveler Identity" />

      {!user ? (
        /* GUEST STATE */
        <section className="px-5 pt-2">
          <div className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-[0_8px_30px_rgba(60,40,20,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Compass className="h-7 w-7" aria-hidden="true" />
            </div>

            <h2 className="mt-4 text-center font-serif text-2xl text-foreground">
              YOUR TRAVEL PASSPORT
            </h2>
            <p className="mt-2 text-center font-serif text-sm italic text-muted-foreground">
              Create an account to keep your stamps and memories forever.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/auth"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-foreground shadow-md transition-all hover:opacity-90"
              >
                Sign In
              </Link>
              <Link
                href="/auth"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/80 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground transition-all hover:bg-card"
              >
                Create Passport
              </Link>
            </div>

            {/* Value Props */}
            <div className="mt-8 border-t border-dashed border-border pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Why Issue a Passport?
              </p>
              <ul className="mt-3 space-y-2.5 font-serif text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
                  Permanent cloud backup of collected stamps
                </li>
                <li className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 shrink-0 text-accent" />
                  Personal travel journal & memory storage
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 shrink-0 text-accent" />
                  Personalized travel stats & state milestones
                </li>
              </ul>
            </div>
          </div>
        </section>
      ) : (
        /* AUTHENTICATED USER STATE */
        <section className="px-5 pt-2 space-y-6">
          {/* Traveler Card */}
          <div className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-[0_8px_30px_rgba(60,40,20,0.08)]">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent ring-2 ring-accent/30 font-serif text-2xl font-semibold">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'T'}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate font-serif text-2xl text-foreground">
                  {profile?.full_name || 'Traveler'}
                </h2>
                {profile?.username && (
                  <p className="font-mono text-[11px] text-accent">
                    @{profile.username}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>
            </div>

            {/* Travel Stats Grid */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-dashed border-border/80 pt-5">
              <div className="rounded-xl border border-border/60 bg-background/50 p-3 text-center">
                <StampIcon className="mx-auto h-4 w-4 text-accent" />
                <p className="mt-1 font-serif text-xl text-foreground">{collectedCount}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  Stamps
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-3 text-center">
                <MapPin className="mx-auto h-4 w-4 text-accent" />
                <p className="mt-1 font-serif text-xl text-foreground">{statesVisitedCount}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  States
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-3 text-center">
                <Bookmark className="mx-auto h-4 w-4 text-accent" />
                <p className="mt-1 font-serif text-xl text-foreground">{memoriesCount}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  Memories
                </p>
              </div>
            </div>
          </div>

          {/* Settings Placeholder */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-5">
            <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <Settings className="h-4 w-4 text-accent" />
              <span>Passport Settings</span>
            </div>
            <div className="mt-3 divide-y divide-border/60 text-xs font-serif text-foreground/80">
              <div className="py-2.5 flex items-center justify-between">
                <span>Notification Preferences</span>
                <span className="font-mono text-[10px] text-muted-foreground">Default</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span>Privacy & Stamp Visibility</span>
                <span className="font-mono text-[10px] text-muted-foreground">Public</span>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <form action={signout}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-destructive transition-all hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </section>
      )}
    </AppShell>
  )
}
