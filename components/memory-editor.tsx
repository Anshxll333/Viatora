'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PenLine, Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export function MemoryEditor({
  initial = '',
  isAuthenticated = false,
  destinationId,
}: {
  initial?: string
  isAuthenticated?: boolean
  destinationId: string
}) {
  const [value, setValue] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const handleEditClick = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }
    
    if (editing) {
      // Save memory — keep editor open on failure
      setSaving(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          if (value.trim()) {
            const { error } = await supabase.from('memories').upsert({
              user_id: user.id,
              destination_id: destinationId,
              content: value,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, destination_id' })
            if (error) throw error
          } else {
            const { error } = await supabase.from('memories').delete().match({
              user_id: user.id,
              destination_id: destinationId
            })
            if (error) throw error
          }
        }
        setEditing(false)
      } catch {
        // Save failed — stay in edit mode so user can retry
      } finally {
        setSaving(false)
      }
      return
    }

    setEditing(true)
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-[0_6px_20px_rgba(60,40,20,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="font-serif text-lg text-foreground">My Memory</h2>
        </div>
        <button
          type="button"
          onClick={handleEditClick}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {saving ? (
            'Saving...'
          ) : editing ? (
            <>
              <Check className="h-3 w-3" aria-hidden="true" />
              Done
            </>
          ) : (
            'Edit'
          )}
        </button>
      </div>

      {showAuthPrompt && (
        <div className="mb-4 rounded-xl border border-accent/40 bg-accent/10 p-3.5 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Lock className="h-4 w-4" />
          </div>
          <p className="font-serif text-xs font-medium text-foreground">
            Travel Passport Required
          </p>
          <p className="mt-1 font-serif text-[11px] italic text-muted-foreground">
            Sign in or create a passport to write and preserve your travel memories forever.
          </p>
          <Link
            href="/auth"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-foreground shadow-sm hover:opacity-90"
          >
            Sign In / Create Passport
          </Link>
        </div>
      )}

      {editing ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          rows={6}
          placeholder="Write about how this journey felt..."
          className="w-full resize-none rounded-lg border border-border bg-background/70 p-3 font-serif text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
      ) : (
        <p
          className={cn(
            'whitespace-pre-wrap font-serif text-[15px] leading-relaxed',
            value ? 'text-foreground/90' : 'text-muted-foreground/70 italic',
          )}
        >
          {value || 'No memory written yet. Tap edit to begin your story.'}
        </p>
      )}
    </div>
  )
}
