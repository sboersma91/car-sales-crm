import { NextResponse } from 'next/server'

import { createSupabaseAuthServerClient } from '../../../../lib/supabase-auth-server'

export async function POST(request: Request) {
  const supabaseAuth = await createSupabaseAuthServerClient()
  await supabaseAuth.auth.signOut({ scope: 'local' })

  return NextResponse.redirect(new URL('/login', request.url), 303)
}
