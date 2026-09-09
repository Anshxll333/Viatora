'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function getOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')
  }
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost:3000'
  const proto = headerList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export async function login(prevState: any, formData: FormData): Promise<{ error?: string; message?: string } | undefined> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please provide both email and password.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signup(prevState: any, formData: FormData): Promise<{ error?: string; message?: string } | undefined> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const rawUsername = formData.get('username') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const username = rawUsername.trim() || email.split('@')[0]
  const supabase = await createClient()

  // Check username availability securely via RPC before attempting signup
  const { data: isAvailable, error: rpcError } = await supabase.rpc('check_username_available', {
    requested_username: username
  })

  if (rpcError) {
    return { error: 'Failed to verify username availability. Please try again.' }
  }

  if (isAvailable === false) {
    return { error: 'That traveler username is already taken. Please choose another.' }
  }

  const origin = await getOrigin()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName || email.split('@')[0],
        username,
      },
    },
  })

  if (error) {
    // Return the actual error message instead of silently converting it
    if (error.message.includes('Database error saving new user')) {
      return { error: 'Signup failed due to a database configuration issue (e.g., passport sequence out of sync). Please check database logs.' }
    }
    return { error: error.message }
  }

  // CASE A: session returned (email confirmation disabled)
  if (data.session) {
    redirect('/')
  }

  // CASE B: no session (email confirmation required)
  // If the user wants immediate login, they must disable "Confirm email" in Supabase Dashboard -> Authentication -> Providers -> Email
  return { message: 'Check your email to verify your passport. (To disable this, turn off "Confirm email" in Supabase Dashboard)' }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth')
}
