import { requireOperatorPage } from '../../../lib/require-operator-page'
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

type TimelineMetadata = Record<string, unknown>
type LeadDetailSearchParams = Promise<{ sms?: string | string[] }>

function getMetadataString(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const value = (metadata as TimelineMetadata)[key]
  return typeof value === 'string' ? value : null
}

function formatEventType(eventType: string, metadata: unknown): string {
  if (eventType === 'manual_note') {
    const activityType = getMetadataString(metadata, 'activity_type')
    return activityType ? `Manual Note (${activityType})` : 'Manual Note'
  }

  if (eventType === 'status_change') return 'Status Change'
  if (eventType === 'reminder_created') return 'Reminder Created'
  if (eventType === 'outbound_sms') return 'Outbound SMS'
  return eventType
}

export default async function LeadDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: LeadDetailSearchParams
}) {
  const accessFailure = await requireOperatorPage()

  if (accessFailure === 'forbidden') {
    return <div>Forbidden</div>
  }

  if (accessFailure === 'configuration_error') {
    return <div>CRM access is unavailable</div>
  }

  const { id } = await params
  const smsResult = (await searchParams).sms

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

  const { data: upcomingReminders, error: upcomingRemindersError } = await supabaseServer
    .from('lead_reminders')
    .select('id, title, note, due_at, completed, created_at')
    .eq('lead_id', id)
    .eq('completed', false)
    .order('due_at', { ascending: true })

  const { data: completedReminders, error: completedRemindersError } = await supabaseServer
    .from('lead_reminders')
    .select('id, title, note, due_at, completed, created_at')
    .eq('lead_id', id)
    .eq('completed', true)
    .order('created_at', { ascending: false })

  const { data: timelineEvents, error: timelineError } = await supabaseServer
    .from('communication_events')
    .select('id, event_type, direction, occurred_at, body, metadata, created_source')
    .eq('lead_id', id)
    .order('occurred_at', { ascending: false })

  const fullName = `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim()
  const currentStatus = isLeadStatus(lead.status) ? lead.status : 'new'

  return (
    <div>
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
          <h2>Send SMS</h2>
          {lead.phone ? (
            <form action={`/api/leads/${lead.id}/sms`} method="post" style={{ display: 'grid', gap: '8px', maxWidth: '420px' }}>
              <label htmlFor="sms-body"><strong>Message:</strong></label>
              <textarea id="sms-body" name="body" rows={4} maxLength={1600} required />
              <button type="submit">Send SMS</button>
            </form>
          ) : (
            <p>A phone number is required before sending SMS.</p>
          )}
          {smsResult === 'sent' ? <p style={{ color: '#0a7a31' }}>SMS sent successfully.</p> : null}
          {smsResult === 'error' ? <p style={{ color: '#b00020' }}>SMS could not be sent.</p> : null}
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2>Communication Timeline</h2>
          {timelineError ? <p>Error loading communication timeline.</p> : null}
          {!timelineError && timelineEvents?.length === 0 ? <p>No communication events yet.</p> : null}
          {!timelineError && timelineEvents && timelineEvents.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {timelineEvents.map((event) => {
                const title = getMetadataString(event.metadata, 'title')
                const dueAt = getMetadataString(event.metadata, 'due_at')

                return (
                  <article key={event.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>
                    <div><strong>{formatEventType(event.event_type, event.metadata)}</strong></div>
                    <div><strong>Direction:</strong> {formatValue(event.direction)}</div>
                    <div><strong>When:</strong> {formatDate(event.occurred_at)}</div>
                    {title ? <div><strong>Reminder:</strong> {title}</div> : null}
                    {dueAt ? <div><strong>Due:</strong> {formatDate(dueAt)}</div> : null}
                    <p style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{formatValue(event.body)}</p>
                  </article>
                )
              })}
            </div>
          ) : null}
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2>Add Reminder</h2>
          <form
            action={`/api/leads/${lead.id}/reminders`}
            method="post"
            style={{ display: 'grid', gap: '8px', maxWidth: '420px' }}
          >
            <label htmlFor="reminder-title"><strong>Title:</strong></label>
            <input id="reminder-title" name="title" required />

            <label htmlFor="reminder-due-at"><strong>Due:</strong></label>
            <input id="reminder-due-at" name="due_at" type="datetime-local" required />

            <label htmlFor="reminder-note"><strong>Note:</strong></label>
            <textarea id="reminder-note" name="note" rows={4} placeholder="Optional reminder note" />

            <button type="submit">Add reminder</button>
          </form>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2>Upcoming Reminders</h2>
          {upcomingRemindersError ? <p>Error loading upcoming reminders.</p> : null}
          {!upcomingRemindersError && upcomingReminders?.length === 0 ? <p>No upcoming reminders.</p> : null}
          {!upcomingRemindersError && upcomingReminders && upcomingReminders.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {upcomingReminders.map((reminder) => (
                <article key={reminder.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>
                  <div><strong>Title:</strong> {formatValue(reminder.title)}</div>
                  <div><strong>Due:</strong> {formatDate(reminder.due_at)}</div>
                  <div><strong>Completed:</strong> {reminder.completed ? 'Yes' : 'No'}</div>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{formatValue(reminder.note)}</p>
                  <form action={`/api/reminders/${reminder.id}/complete`} method="post">
                    <button type="submit">Mark complete</button>
                  </form>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2>Completed Reminders</h2>
          {completedRemindersError ? <p>Error loading completed reminders.</p> : null}
          {!completedRemindersError && completedReminders?.length === 0 ? <p>No completed reminders.</p> : null}
          {!completedRemindersError && completedReminders && completedReminders.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {completedReminders.map((reminder) => (
                <article key={reminder.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>
                  <div><strong>Title:</strong> {formatValue(reminder.title)}</div>
                  <div><strong>Due:</strong> {formatDate(reminder.due_at)}</div>
                  <div><strong>Completed:</strong> {reminder.completed ? 'Yes' : 'No'}</div>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{formatValue(reminder.note)}</p>
                </article>
              ))}
            </div>
          ) : null}
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
