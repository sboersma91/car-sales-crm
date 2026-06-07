import { NextResponse } from 'next/server'

import { requireOperatorApi } from '../../../../../lib/require-operator-api'
import { supabaseServer } from '../../../../../lib/supabase-server'
import { sendTwilioSms } from '../../../../../lib/twilio-server'

const MAX_SMS_LENGTH = 1600

function errorRedirect(request: Request, id: string): NextResponse {
  return NextResponse.redirect(new URL(`/leads/${id}?sms=error`, request.url), 303)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorizationFailure = await requireOperatorApi()
  if (authorizationFailure) return authorizationFailure

  const { id } = await params
  const formData = await request.formData()
  const bodyValue = formData.get('body')
  const body = typeof bodyValue === 'string' ? bodyValue.trim() : ''

  if (!body || body.length > MAX_SMS_LENGTH) {
    return errorRedirect(request, id)
  }

  const { data: lead, error: leadError } = await supabaseServer
    .from('leads')
    .select('phone')
    .eq('id', id)
    .single()

  if (leadError || !lead?.phone) {
    return errorRedirect(request, id)
  }

  try {
    const message = await sendTwilioSms(lead.phone, body)
    const { error: timelineError } = await supabaseServer.from('communication_events').insert({
      lead_id: id,
      event_type: 'outbound_sms',
      direction: 'outbound',
      occurred_at: message.occurredAt,
      body,
      metadata: {
        twilio_message_sid: message.sid,
        twilio_status: message.status,
      },
      created_source: 'twilio_outbound_sms',
    })

    if (timelineError) {
      console.error('Outbound SMS timeline insert failed:', timelineError.message)
      return errorRedirect(request, id)
    }

    return NextResponse.redirect(new URL(`/leads/${id}?sms=sent`, request.url), 303)
  } catch {
    return errorRedirect(request, id)
  }
}
