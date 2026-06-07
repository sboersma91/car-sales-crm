import 'server-only'

type TwilioMessageResponse = {
  date_created?: string | null
  error_code?: number | null
  sid?: string
  status?: string
}

export type SentTwilioMessage = {
  occurredAt: string
  sid: string
  status: string | null
}

function normalizeTwilioTimestamp(value: string | null | undefined): string {
  if (!value) return new Date().toISOString()

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

function getTwilioConfiguration() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio is not configured')
  }

  return { accountSid, authToken, fromNumber }
}

export async function sendTwilioSms(to: string, body: string): Promise<SentTwilioMessage> {
  const { accountSid, authToken, fromNumber } = getTwilioConfiguration()
  const payload = new URLSearchParams({ Body: body, From: fromNumber, To: to })
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
    cache: 'no-store',
  })
  const result = (await response.json().catch(() => null)) as TwilioMessageResponse | null

  if (!response.ok || !result?.sid || result.error_code) {
    throw new Error('Twilio message send failed')
  }

  return {
    occurredAt: normalizeTwilioTimestamp(result.date_created),
    sid: result.sid,
    status: result.status ?? null,
  }
}
