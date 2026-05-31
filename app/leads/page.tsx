import { supabaseServer } from '../../lib/supabase-server'
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

export default async function LeadsPage() {
  const { data: leads, error } = await supabaseServer
    .from('leads')
    .select('id, first_name, last_name, email, phone, vehicle_interest, status, source, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading leads</div>
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1>Leads</h1>

      {leads && leads.length === 0 ? <p>No leads found.</p> : null}

      <div style={{ display: 'grid', gap: '20px' }}>
        {leads?.map((lead) => (
          <div key={lead.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
            <h2 style={{ marginBottom: '8px' }}>
              <Link href={`/leads/${lead.id}`}>
                {formatValue(`${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim())}
              </Link>
            </h2>

            <div style={{ display: 'grid', gap: '4px' }}>
              <div><strong>Phone:</strong> {formatValue(lead.phone)}</div>
              <div><strong>Email:</strong> {formatValue(lead.email)}</div>
              <div><strong>Vehicle Interest:</strong> {formatValue(lead.vehicle_interest)}</div>
              <div><strong>Status:</strong> {formatValue(lead.status)}</div>
              <div><strong>Source:</strong> {formatValue(lead.source)}</div>
              <div><strong>Created:</strong> {formatDate(lead.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
