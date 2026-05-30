import { supabaseServer } from '../../../lib/supabase-server'
import Link from 'next/link'

function formatValue(value: string | null): string {
  return value?.trim() ? value : 'Not provided'
}

function formatDate(value: string | null): string {
  if (!value) return 'Not provided'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not provided'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: lead, error } = await supabaseServer
    .from('leads')
    .select('id, first_name, last_name, email, phone, vehicle_interest, notes, status, source, created_at')
    .eq('id', id)
    .single()

  if (error || !lead) {
    return <div>Lead not found</div>
  }

  const fullName = `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim()

  return (
    <div style={{ padding: '40px' }}>
      <Link href="/leads">Back to leads</Link>

      <div style={{ marginTop: '24px' }}>
        <h1>Lead Detail</h1>

        <div style={{ display: 'grid', gap: '8px', marginTop: '16px' }}>
          <div><strong>Name:</strong> {formatValue(fullName)}</div>
          <div><strong>Phone:</strong> {formatValue(lead.phone)}</div>
          <div><strong>Email:</strong> {formatValue(lead.email)}</div>
          <div><strong>Vehicle Interest:</strong> {formatValue(lead.vehicle_interest)}</div>
          <div><strong>Status:</strong> {formatValue(lead.status)}</div>
          <div><strong>Source:</strong> {formatValue(lead.source)}</div>
          <div><strong>Created:</strong> {formatDate(lead.created_at)}</div>
        </div>

        <section style={{ marginTop: '24px' }}>
          <h2>Notes</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{formatValue(lead.notes)}</p>
        </section>
      </div>
    </div>
  )
}
