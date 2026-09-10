'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PenLine, Check, Lock, Camera, Trash2, Loader2, ImagePlus, Share, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import html2canvas from 'html2canvas'

export interface PhotoItem {
  id: string
  url: string
}

export function MemoryEditor({
  initial = '',
  initialPhotos = [],
  isAuthenticated = false,
  destinationId,
  destinationName,
  destinationCountry,
  stampUrl,
  visitedDate,
}: {
  initial?: string
  initialPhotos?: PhotoItem[]
  isAuthenticated?: boolean
  destinationId: string
  destinationName?: string
  destinationCountry?: string
  stampUrl?: string
  visitedDate?: string
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState(initial)
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos)
  const [editing, setEditing] = useState(false)
  const [useHandwriting, setUseHandwriting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isGeneratingShare, setIsGeneratingShare] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  const handleEditClick = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    if (editing) {
      setSaving(true)
      setErrorMsg(null)
      
      const currentContent = editorRef.current?.innerHTML || ''
      setValue(currentContent)

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          if (currentContent.trim() && currentContent !== '<br>') {
            // Check if it's just empty tags
            const textContent = editorRef.current?.textContent || ''
            if (!textContent.trim() && !currentContent.includes('<img')) {
              const { error } = await supabase.from('memories').delete().match({
                user_id: user.id,
                destination_id: destinationId,
              })
              if (error) throw error
            } else {
              const { error } = await supabase.from('memories').upsert(
                {
                  user_id: user.id,
                  destination_id: destinationId,
                  content: currentContent,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id, destination_id' }
              )
              if (error) throw error
            }
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
        setShowEmojiPicker(false)
      } catch (err: any) {
        console.error('Failed to save memory:', err)
        setErrorMsg('Failed to save memory text. Please try again.')
      } finally {
        setSaving(false)
      }
      return
    }

    setEditing(true)
    // Focus the editor at the end of the text after a short delay to allow rendering
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus()
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(editorRef.current)
        range.collapse(false)
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }, 50)
  }

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const insertEmoji = (emoji: string) => {
    execCommand('insertText', emoji)
    setShowEmojiPicker(false)
  }

  const TRAVEL_EMOJIS = ['✈️', '🌴', '🏔️', '📸', '🌸', '🍷', '🍝', '🏰', '🌅', '🎒', '🚂', '🗺️']

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

  const handleShare = async () => {
    if (!value && photos.length === 0) {
      setErrorMsg('Add a memory or photo to share.')
      return
    }

    if (!shareCardRef.current) return

    setIsGeneratingShare(true)
    setErrorMsg(null)

    try {
      // Ensure the element is temporarily visible for html2canvas
      shareCardRef.current.style.display = 'block'
      
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#fdfbf7', // Match cream paper
      })

      shareCardRef.current.style.display = 'none'

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
      })

      if (!blob) throw new Error('Failed to generate image blob')

      const file = new File([blob], `viatora-${destinationName?.toLowerCase() || 'memory'}.jpg`, { type: 'image/jpeg' })

      // Try native Web Share API with files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My trip to ${destinationName}`,
          text: `A memory from ${destinationName}, ${destinationCountry}`,
        })
      } else {
        // Fallback: Download the image
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err: any) {
      console.error('Error sharing:', err)
      if (err.name !== 'AbortError') {
        setErrorMsg('Could not generate share image. Please try again.')
      }
    } finally {
      setIsGeneratingShare(false)
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Hidden Share Card Template */}
      <div
        ref={shareCardRef}
        className="absolute left-[-9999px] top-[-9999px] w-[1080px] h-[1920px] bg-[#fdfbf7] overflow-hidden"
        style={{ display: 'none' }}
      >
        {/* Vintage paper texture overlay */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-multiply pointer-events-none z-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        
        {/* Inner Border */}
        <div className="absolute inset-8 border-[3px] border-[#3c2814]/10 z-20 pointer-events-none"></div>
        <div className="absolute inset-10 border border-[#3c2814]/20 z-20 pointer-events-none"></div>

        <div className="relative z-30 h-full flex flex-col p-20">
          {/* Header */}
          <div className="flex justify-between items-start mb-16">
            <div>
              <h1 className="font-serif text-7xl text-[#3c2814] leading-none mb-4">{destinationName}</h1>
              <p className="font-mono text-2xl uppercase tracking-[0.3em] text-[#3c2814]/60">{destinationCountry}</p>
            </div>
            {stampUrl && (
              <div className="w-48 h-64 rotate-[3deg] shadow-[0_20px_50px_rgba(60,40,20,0.15)] bg-white p-2 border border-[#3c2814]/10">
                <img src={stampUrl} alt="Stamp" className="w-full h-full object-cover" crossOrigin="anonymous" />
              </div>
            )}
          </div>

          {/* Photo */}
          {photos.length > 0 && (
            <div className="mb-16 flex-1 flex items-center justify-center">
              <div className="relative max-w-full max-h-[800px] rotate-[-1deg] shadow-[0_30px_60px_rgba(60,40,20,0.2)] bg-white p-4 border border-[#3c2814]/10">
                <img src={photos[0].url} alt="Travel Photo" className="max-w-full max-h-[750px] object-contain" crossOrigin="anonymous" />
              </div>
            </div>
          )}

          {/* Memory Text */}
          {value && (
            <div className="mb-16 flex-1 flex flex-col justify-center">
              <div className="relative">
                <div className="absolute -left-8 top-0 bottom-0 w-1 bg-[#d35400]/20"></div>
                <p
                  className="font-serif text-4xl text-[#3c2814]/90 leading-[1.8] whitespace-pre-wrap"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 63px, rgba(60,40,20,0.08) 63px, rgba(60,40,20,0.08) 64px)',
                    lineHeight: '64px',
                    paddingTop: '12px',
                    backgroundAttachment: 'local'
                  }}
                >
                  {value}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-8 border-t-2 border-[#3c2814]/20 flex justify-between items-end">
            <div>
              <p className="font-serif text-4xl tracking-[0.15em] text-[#3c2814]">VIATORA</p>
              <p className="font-mono text-xl uppercase tracking-[0.2em] text-[#3c2814]/50 mt-2">Travel Passport</p>
            </div>
            {visitedDate && (
              <div className="text-right">
                <p className="font-mono text-xl uppercase tracking-[0.2em] text-[#3c2814]/50 mb-2">Collected</p>
                <p className="font-serif text-3xl text-[#3c2814]/80 italic">{visitedDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Journal Section (Moved Above) */}
      <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-[0_6px_20px_rgba(60,40,20,0.06)]">
        <div className="mb-4 flex items-center justify-between">
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
                className="group relative h-36 w-28 shrink-0 rounded-sm border-[5px] border-card bg-card p-0 shadow-[0_6px_18px_rgba(60,40,20,0.14)]"
              >
                <Image
                  src={photo.url}
                  alt={`Trip photo ${i + 1}`}
                  fill
                  sizes="112px"
                  className="rounded-[1px] object-cover"
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

      {/* Memory Journal Section (Redesigned) */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-[#fdfbf7] p-6 shadow-[0_8px_30px_rgba(60,40,20,0.08)]">
        {/* Vintage paper texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        
        <div className="relative z-10">
          <div className="mb-5 flex items-center justify-between border-b border-dashed border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="font-serif text-xl text-foreground tracking-wide">MY JOURNAL</h2>
            </div>
            <div className="flex items-center gap-2">
              {(value || photos.length > 0) && !editing && (
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isGeneratingShare}
                  className="flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
                >
                  {isGeneratingShare ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Share className="h-3 w-3" />
                      Share
                    </>
                  )}
                </button>
              )}
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

          {editing && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-lg border border-border/50 bg-background/50 p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setUseHandwriting(!useHandwriting)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  useHandwriting ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-black/5"
                )}
                title="Toggle Handwriting Font"
              >
                <Type className="h-4 w-4" />
              </button>
              <div className="h-4 w-px bg-border/50 mx-1" />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <div className="h-4 w-px bg-border/50 mx-1" />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); execCommand('justifyLeft'); }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); execCommand('justifyCenter'); }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight'); }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <div className="h-4 w-px bg-border/50 mx-1" />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                    showEmojiPicker ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-black/5"
                  )}
                  title="Insert Emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute left-0 top-full z-50 mt-1 flex w-[180px] flex-wrap gap-1 rounded-xl border border-border/70 bg-popover p-2 shadow-md">
                    {TRAVEL_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); insertEmoji(emoji); }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-lg hover:bg-accent/10"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="min-h-[120px]">
            {editing ? (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className={cn(
                  "w-full min-h-[120px] resize-none rounded-lg border-none bg-transparent p-0 text-[16px] leading-loose text-foreground outline-none focus:ring-0",
                  useHandwriting ? "font-caveat text-[22px]" : "font-serif"
                )}
                style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.05) 31px, rgba(0,0,0,0.05) 32px)',
                  lineHeight: '32px',
                  paddingTop: '6px',
                  whiteSpace: 'pre-wrap'
                }}
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <>
                {value ? (
                  <div
                    className={cn(
                      "whitespace-pre-wrap text-[16px] text-foreground/90",
                      useHandwriting ? "font-caveat text-[22px]" : "font-serif"
                    )}
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.05) 31px, rgba(0,0,0,0.05) 32px)',
                      lineHeight: '32px',
                      paddingTop: '6px',
                      backgroundAttachment: 'local'
                    }}
                    dangerouslySetInnerHTML={{ __html: value }}
                  />
                ) : (
                  <p className="font-serif text-[15px] italic text-muted-foreground/50 pt-2">
                    No memory written yet. Tap Edit to begin your journal entry.
                  </p>
                )}
              </>
            )}
          </div>
          
          {/* Subtle branding at bottom of journal */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/30">
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground/40">Viatora Journal</span>
            {visitedDate && <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60">{visitedDate}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

