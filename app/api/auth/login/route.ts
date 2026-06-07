import { NextResponse } from 'next/server'

import { requireConfiguredOperator } from '../../../../lib/require-operator'
import { createSupabaseAuthServerClient } from '../../../../lib/supabase-auth-server'

function loginRedirect(request: Request, failed = false): NextResponse {
  const url = new URL('/login', request.url)
  if (failed) url.searchParams.set('error', '1')
  return NextResponse.redirect(url, 303)
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get('email')
    const password = formData.get('password')

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return loginRedirect(request, true)
    }

    const supabaseAuth = await createSupabaseAuthServerClient()
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email: email.trim(), password })

    if (error || !data.user) {
      return loginRedirect(request, true)
    }

    try {
      requireConfiguredOperator(data.user)
    } catch {
      await supabaseAuth.auth.signOut({ scope: 'local' })
      return loginRedirect(request, true)
    }

    return NextResponse.redirect(new URL('/leads', request.url), 303)
  } catch {
    return loginRedirect(request, true)
  }
}
