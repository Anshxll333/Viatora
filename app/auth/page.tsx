'use client'

import { useActionState, useState } from 'react'
import { Globe, Compass, ArrowRight, KeyRound, Mail, User, Tag } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { login, signup } from './actions'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loginState, loginAction, loginPending] = useActionState(login, null)
  const [signupState, signupAction, signupPending] = useActionState(signup, null)

  const activeState = mode === 'signin' ? loginState : signupState
  const isPending = mode === 'signin' ? loginPending : signupPending

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
            Passport Verification
          </span>
          <Globe className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>

        <h1 className="mt-3 text-balance font-serif text-3xl text-foreground">
          {mode === 'signin' ? 'Welcome back, traveler.' : 'Begin your journey.'}
        </h1>
        <p className="mt-2 text-balance font-serif text-sm italic text-muted-foreground">
          {mode === 'signin'
            ? 'Open your passport to access your collected destinations and memories.'
            : 'Issue your digital travel passport to start collecting stamps worldwide.'}
        </p>

        {/* Tab Toggle */}
        <div className="mt-6 flex rounded-xl border border-border/70 bg-card/40 p-1">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-lg py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${
              mode === 'signin'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-lg py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${
              mode === 'signup'
                ? 'bg-card text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Passport
          </button>
        </div>

        {/* Form Card */}
        <div className="mt-6 rounded-2xl border border-border/70 bg-card/70 p-6 shadow-[0_6px_20px_rgba(60,40,20,0.06)]">
          {activeState?.error && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center font-serif text-xs text-destructive">
              {activeState.error}
            </div>
          )}
          {activeState?.message && (
            <div className="mb-4 rounded-xl border border-accent/30 bg-accent/10 p-3 text-center font-serif text-xs text-accent">
              {activeState.message}
            </div>
          )}

          <form action={mode === 'signin' ? loginAction : signupAction} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      name="fullName"
                      type="text"
                      placeholder="e.g. Elena Rossi"
                      className="w-full rounded-xl border border-border/80 bg-background/70 py-2.5 pl-9 pr-3 font-serif text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Traveler Username
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      name="username"
                      type="text"
                      placeholder="e.g. elenarossi"
                      className="w-full rounded-xl border border-border/80 bg-background/70 py-2.5 pl-9 pr-3 font-serif text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="traveler@viatora.com"
                  className="w-full rounded-xl border border-border/80 bg-background/70 py-2.5 pl-9 pr-3 font-serif text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Passcode / Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border/80 bg-background/70 py-2.5 pl-9 pr-3 font-serif text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                'Verifying...'
              ) : mode === 'signin' ? (
                <>
                  Open Passport
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Issue Passport
                  <Compass className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Vintage Footer Stamp Motif */}
        <div className="mt-8 text-center">
          <p className="font-serif text-xs italic text-muted-foreground">
            VIATORA · Digital Travel Passport & Memories
          </p>
        </div>
      </div>
    </AppShell>
  )
}
