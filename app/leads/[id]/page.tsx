import { supabaseServer } from '../../../lib/supabase-server'
import { LEAD_ACTIVITY_TYPES } from '../../../lib/lead-activity-types'
import { LEAD_STATUSES, isLeadStatus } from '../../../lib/lead-status'
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
    .select('id, first_name, last_name, email, phone, vehicle_interest, notes, status, source, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error || !lead) {
    return <div>Lead not found</div>
  }

  const { data: activities, error: activitiesError } = await supabaseServer
    .from('lead_activities')
    .select('id, type, note, created_at')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })

  const fullName = `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim()
  const currentStatus = isLeadStatus(lead.status) ? lead.status : 'new'

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
          <div><strong>Updated:</strong> {formatDate(lead.updated_at)}</div>
        </div>

        <section style={{ marginTop: '24px' }}>
          <h2>Workflow Status</h2>
          <form
            action={`/api/leads/${lead.id}/status`}
            method="post"
            style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <label htmlFor="status"><strong>Status:</strong></label>
            <select id="status" name="status" defaultValue={currentStatus}>
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button type="submit">Update status</button>
          </form>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2>Notes</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{formatValue(lead.notes)}</p>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2>Add Activity</h2>
          <form action={`/api/leads/${lead.id}/activities`} method="post" style={{ display: 'grid', gap: '8px', maxWidth: '420px' }}>
            <label htmlFor="activity-type"><strong>Type:</strong></label>
            <select id="activity-type" name="type" defaultValue="note">
              {LEAD_ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <label htmlFor="activity-note"><strong>Note:</strong></label>
            <textarea id="activity-note" name="note" rows={4} placeholder="Optional activity note" />

            <button type="submit">Add activity</button>
          </form>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2>Activity History</h2>
          {activitiesError ? <p>Error loading activities.</p> : null}
          {!activitiesError && activities?.length === 0 ? <p>No activities yet.</p> : null}
          {!activitiesError && activities && activities.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {activities.map((activity) => (
                <article key={activity.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>
                  <div><strong>Type:</strong> {formatValue(activity.type)}</div>
                  <div><strong>Created:</strong> {formatDate(activity.created_at)}</div>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{formatValue(activity.note)}</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>

      </div>
    </div>
  )
}
