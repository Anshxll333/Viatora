import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'
import { signout } from '@/app/auth/actions'

export async function BrandBar() {
  let travelerName = ''
  let isAuthenticated = false

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      isAuthenticated = true
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle()
      travelerName = profile?.username || user.user_metadata?.username || ''
    }
  } catch {
    // Leave identity empty when Supabase is unavailable.
  }

  return (
    <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 font-serif text-sm italic text-accent"
        >
          V
        </span>
        <div className="leading-none">
          <p className="font-serif text-lg tracking-[0.18em] text-foreground">VIATORA</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right leading-tight">
        {isAuthenticated && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Traveler
            </p>
            <p className="font-serif text-sm text-foreground">{travelerName}</p>
          </div>
        )}
        {isAuthenticated && (
          <form action={signout}>
            <button
              type="submit"
              title="Sign Out"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border/80 bg-card/60 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <LogOut className="h-3.5 w-3.5" aria-label="Sign Out" />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

