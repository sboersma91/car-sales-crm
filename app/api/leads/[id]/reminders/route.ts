import { NextResponse } from 'next/server'

import { supabaseServer } from '../../../../../lib/supabase-server'

function normalizeOptionalString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const formData = await request.formData()
  const title = normalizeOptionalString(formData.get('title'))
  const note = normalizeOptionalString(formData.get('note'))
  const dueAtValue = normalizeOptionalString(formData.get('due_at'))

  if (!title) {
    return NextResponse.json({ error: 'Reminder title is required' }, { status: 400 })
  }

  if (!dueAtValue) {
    return NextResponse.json({ error: 'Reminder due date is required' }, { status: 400 })
  }

  const dueAt = new Date(dueAtValue)
  if (Number.isNaN(dueAt.getTime())) {
    return NextResponse.json({ error: 'Reminder due date is invalid' }, { status: 400 })
  }

  const { error } = await supabaseServer
    .from('lead_reminders')
    .insert({
      lead_id: id,
      title,
      note,
      due_at: dueAt.toISOString(),
    })

  if (error) {
    console.error('Lead reminder creation failed:', error.message)
    return NextResponse.json({ error: 'Lead reminder creation failed' }, { status: 500 })
  }

  return NextResponse.redirect(new URL(`/leads/${id}`, request.url), 303)
}
