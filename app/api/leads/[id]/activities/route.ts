import { NextResponse } from 'next/server'

import { isLeadActivityType } from '../../../../../lib/lead-activity-types'
import { supabaseServer } from '../../../../../lib/supabase-server'

function normalizeOptionalNote(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const formData = await request.formData()
  const type = formData.get('type')
  const note = normalizeOptionalNote(formData.get('note'))

  if (!isLeadActivityType(type)) {
    return NextResponse.json({ error: 'Invalid lead activity type' }, { status: 400 })
  }

  const { error } = await supabaseServer
    .from('lead_activities')
    .insert({
      lead_id: id,
      type,
      note,
    })

  if (error) {
    console.error('Lead activity creation failed:', error.message)
    return NextResponse.json({ error: 'Lead activity creation failed' }, { status: 500 })
  }

  return NextResponse.redirect(new URL(`/leads/${id}`, request.url), 303)
}
