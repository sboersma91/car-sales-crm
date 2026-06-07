import { NextResponse } from 'next/server'

import { requireOperatorApi } from '../../../../../lib/require-operator-api'
import { isLeadStatus } from '../../../../../lib/lead-status'
import { supabaseServer } from '../../../../../lib/supabase-server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorizationFailure = await requireOperatorApi()
  if (authorizationFailure) return authorizationFailure

  const { id } = await params
  const formData = await request.formData()
  const status = formData.get('status')

  if (!isLeadStatus(status)) {
    return NextResponse.json({ error: 'Invalid lead status' }, { status: 400 })
  }

  const { error } = await supabaseServer
    .from('leads')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Lead status update failed:', error.message)
    return NextResponse.json({ error: 'Lead status update failed' }, { status: 500 })
  }

  return NextResponse.redirect(new URL(`/leads/${id}`, request.url), 303)
}
