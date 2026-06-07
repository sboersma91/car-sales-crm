import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const AUTH_COOKIE_NAME = 'crm-auth-session'

function getRequiredAuthEnvironment() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!publishableKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  }

  return { publishableKey, supabaseUrl }
}

export async function createSupabaseAuthServerClient() {
  const { publishableKey, supabaseUrl } = getRequiredAuthEnvironment()
  const cookieStore = await cookies()

  return createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
      storageKey: AUTH_COOKIE_NAME,
      storage: {
        getItem(key) {
          return cookieStore.get(key)?.value ?? null
        },
        setItem(key, value) {
          try {
            cookieStore.set(key, value, {
              httpOnly: true,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          } catch {
            // Server Components can read cookies but cannot write refreshed auth state.
          }
        },
        removeItem(key) {
          try {
            cookieStore.delete(key)
          } catch {
            // Server Components cannot clear cookies; a Route Handler or Server Action can.
          }
        },
      },
    },
  })
}
