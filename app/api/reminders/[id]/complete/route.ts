import { NextResponse } from 'next/server'

import { requireOperatorApi } from '../../../../../lib/require-operator-api'
import { supabaseServer } from '../../../../../lib/supabase-server'

function getRedirectUrl(request: Request): URL {
  const fallbackUrl = new URL('/leads', request.url)
  const referer = request.headers.get('referer')

  if (!referer) return fallbackUrl

  try {
    const redirectUrl = new URL(referer)
    return redirectUrl.origin === fallbackUrl.origin ? redirectUrl : fallbackUrl
  } catch {
    return fallbackUrl
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorizationFailure = await requireOperatorApi()
  if (authorizationFailure) return authorizationFailure

  const { id } = await params

  const { error } = await supabaseServer
    .from('lead_reminders')
    .update({ completed: true })
    .eq('id', id)

  if (error) {
    console.error('Lead reminder completion failed:', error.message)
    return NextResponse.json({ error: 'Lead reminder completion failed' }, { status: 500 })
  }

  return NextResponse.redirect(getRedirectUrl(request), 303)
}
