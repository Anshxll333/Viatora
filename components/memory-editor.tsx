'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PenLine, Check, Lock, Camera, Trash2, Loader2, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export interface PhotoItem {
  id: string
  url: string
}

export function MemoryEditor({
  initial = '',
  initialPhotos = [],
  isAuthenticated = false,
  destinationId,
}: {
  initial?: string
  initialPhotos?: PhotoItem[]
  isAuthenticated?: boolean
  destinationId: string
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState(initial)
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleEditClick = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    if (editing) {
      setSaving(true)
      setErrorMsg(null)
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          if (value.trim()) {
            const { error } = await supabase.from('memories').upsert(
              {
                user_id: user.id,
                destination_id: destinationId,
                content: value,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id, destination_id' }
            )
            if (error) throw error
          } else {
            const { error } = await supabase.from('memories').delete().match({
              user_id: user.id,
              destination_id: destinationId,
            })
            if (error) throw error
          }
          router.refresh()
        }
        setEditing(false)
      } catch (err: any) {
        console.error('Failed to save memory:', err)
        setErrorMsg('Failed to save memory text. Please try again.')
      } finally {
        setSaving(false)
      }
      return
    }

    setEditing(true)
  }

  const handleAddPhotoClick = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }
    if (photos.length >= 5) {
      setErrorMsg('Maximum 5 photos allowed per destination.')
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.')
      return
    }

    setUploading(true)
    setErrorMsg(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setShowAuthPrompt(true)
        return
      }

      // Ensure a memory row exists first
      const { data: memoryData, error: memErr } = await supabase
        .from('memories')
        .upsert(
          {
            user_id: user.id,
            destination_id: destinationId,
            content: value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, destination_id' }
        )
        .select('id')
        .single()

      if (memErr || !memoryData) {
        throw memErr || new Error('Failed to initialize memory row.')
      }

      const memoryId = memoryData.id

      // Upload file to storage bucket if available, or fall back to Data URL
      let photoUrl = ''
      try {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${user.id}/${destinationId}_${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('memory-photos')
          .upload(fileName, file, { upsert: true })

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('memory-photos')
            .getPublicUrl(uploadData.path)
          photoUrl = publicUrlData.publicUrl
        }
      } catch (storageErr) {
        console.warn('Storage upload error, using inline image:', storageErr)
      }

      if (!photoUrl) {
        // Fallback to Data URL if storage bucket is not configured
        photoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      // Insert record into memory_photos
      const { data: photoRecord, error: photoErr } = await supabase
        .from('memory_photos')
        .insert({
          memory_id: memoryId,
          photo_url: photoUrl,
        })
        .select('id, photo_url')
        .single()

      if (photoErr || !photoRecord) {
        throw photoErr || new Error('Failed to record memory photo.')
      }

      setPhotos((prev) => [...prev, { id: photoRecord.id, url: photoRecord.photo_url }])
      router.refresh()
    } catch (err: any) {
      console.error('Failed to upload photo:', err)
      setErrorMsg('Could not upload photo. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    setDeletingPhotoId(photoId)
    setErrorMsg(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('memory_photos').delete().eq('id', photoId)
      if (error) throw error

      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      router.refresh()
    } catch (err: any) {
      console.error('Failed to delete photo:', err)
      setErrorMsg('Could not remove photo. Please try again.')
    } finally {
      setDeletingPhotoId(null)
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-[0_6px_20px_rgba(60,40,20,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="font-serif text-lg text-foreground">My Memory & Journal</h2>
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
            'Edit Story'
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
            Sign in or create a passport to write and preserve your travel memories and photos.
          </p>
          <Link
            href="/auth"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-foreground shadow-sm hover:opacity-90"
          >
            Sign In / Create Passport
          </Link>
        </div>
      )}

      {errorMsg && (
        <p className="mb-3 text-xs text-destructive">{errorMsg}</p>
      )}

      {editing ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          rows={5}
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
          {value || 'No memory written yet. Tap Edit Story to begin.'}
        </p>
      )}

      {/* Photo Journal Section */}
      <div className="mt-6 border-t border-dashed border-border/80 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <Camera className="h-3.5 w-3.5 text-accent" />
            <span>Travel Photos ({photos.length}/5)</span>
          </div>

          {photos.length < 5 && (
            <button
              type="button"
              onClick={handleAddPhotoClick}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImagePlus className="h-3 w-3" />
                  Add Photo
                </>
              )}
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {photos.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className="group relative shrink-0 rounded-sm border-[5px] border-card bg-card p-0 shadow-[0_6px_18px_rgba(60,40,20,0.14)]"
              >
                <img
                  src={photo.url}
                  alt={`Trip photo ${i + 1}`}
                  className="h-36 w-28 rounded-[1px] object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  disabled={deletingPhotoId === photo.id}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-90 transition-opacity hover:bg-destructive disabled:opacity-50"
                  aria-label="Remove photo"
                >
                  {deletingPhotoId === photo.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-serif text-xs italic text-muted-foreground/70">
            No photos added yet. Tap Add Photo to save up to 5 photos from your trip.
          </p>
        )}
      </div>
    </div>
  )
}

