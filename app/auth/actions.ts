'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  // Profile username has a unique database constraint. Let it resolve concurrent signups.
  // No service-role key needed in this server action.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
        username,
      },
    },
  })

  if (error) {
    if (error.message.includes('Database error saving new user') || error.message.includes('duplicate key value')) {
      return { error: 'That traveler username is already taken. Please choose another.' }
    }
    return { error: error.message }
  }

  // CASE A: session returned (email confirmation disabled)
  if (data.session) {
    redirect('/')
  }

  // CASE B: no session (email confirmation required)
  return { message: 'Check your email to verify your passport.' }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth')
}
