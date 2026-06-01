import { supabaseServer } from '../../lib/supabase-server'
import Link from 'next/link'

type LeadSearchParams = Promise<{ q?: string | string[] }>

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

function getSearchQuery(value: string | string[] | undefined): string {
  const rawValue = Array.isArray(value) ? value[0] : value
  return rawValue?.trim() ?? ''
}

function matchesSearch(lead: {
  first_name: string | null
  last_name: string | null
  phone: string | null
  email: string | null
}, query: string): boolean {
  if (!query) return true

  const normalizedQuery = query.toLowerCase()
  return [lead.first_name, lead.last_name, lead.phone, lead.email].some((value) =>
    value?.toLowerCase().includes(normalizedQuery),
  )
}

export default async function LeadsPage({ searchParams }: { searchParams: LeadSearchParams }) {
  const query = getSearchQuery((await searchParams).q)

  const { data: leads, error } = await supabaseServer
    .from('leads')
    .select('id, first_name, last_name, email, phone, vehicle_interest, status, source, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading leads</div>
  }

  const filteredLeads = leads?.filter((lead) => matchesSearch(lead, query)) ?? []
  const leadIds = filteredLeads.map((lead) => lead.id)
  const now = new Date()

  const { data: incompleteReminders, error: remindersError } = leadIds.length > 0
    ? await supabaseServer
      .from('lead_reminders')
      .select('lead_id, due_at')
      .in('lead_id', leadIds)
      .eq('completed', false)
      .order('due_at', { ascending: true })
    : { data: [], error: null }

  const reminderSummaryByLead = new Map<
    number,
    { overdueCount: number; nextUpcomingDueAt: string | null }
  >()

  for (const reminder of incompleteReminders ?? []) {
    const dueAt = new Date(reminder.due_at)
    if (Number.isNaN(dueAt.getTime())) continue

    const currentSummary = reminderSummaryByLead.get(reminder.lead_id) ?? {
      overdueCount: 0,
      nextUpcomingDueAt: null,
    }

    if (dueAt < now) {
      currentSummary.overdueCount += 1
    } else if (!currentSummary.nextUpcomingDueAt) {
      currentSummary.nextUpcomingDueAt = reminder.due_at
    }

    reminderSummaryByLead.set(reminder.lead_id, currentSummary)
  }

  return (
    <div>
      <h1>Leads</h1>

      <form action="/leads" method="get" style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
        <input
          type="search"
          name="q"
          placeholder="Search name, phone, or email"
          defaultValue={query}
          aria-label="Search leads"
        />
        <button type="submit">Search</button>
        {query ? <Link href="/leads">Clear</Link> : null}
      </form>

      {remindersError ? <p>Error loading reminder summary.</p> : null}
      {filteredLeads.length === 0 ? <p>No leads found.</p> : null}

      <div style={{ display: 'grid', gap: '20px', marginTop: '24px' }}>
        {filteredLeads.map((lead) => {
          const reminderSummary = reminderSummaryByLead.get(lead.id)
          const overdueCount = reminderSummary?.overdueCount ?? 0
          const nextUpcomingDueAt = reminderSummary?.nextUpcomingDueAt ?? null

          return (
            <div key={lead.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
              <h2 style={{ marginBottom: '8px' }}>
                <Link href={`/leads/${lead.id}`}>
                  {formatValue(`${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim())}
                </Link>
              </h2>

              {overdueCount > 0 ? <p><strong>Needs Attention</strong></p> : null}

              <div style={{ display: 'grid', gap: '4px' }}>
                <div><strong>Phone:</strong> {formatValue(lead.phone)}</div>
                <div><strong>Email:</strong> {formatValue(lead.email)}</div>
                <div><strong>Vehicle Interest:</strong> {formatValue(lead.vehicle_interest)}</div>
                <div><strong>Status:</strong> {formatValue(lead.status)}</div>
                <div><strong>Source:</strong> {formatValue(lead.source)}</div>
                <div><strong>Overdue Reminders:</strong> {overdueCount}</div>
                <div><strong>Next Reminder:</strong> {formatDate(nextUpcomingDueAt)}</div>
                <div><strong>Created:</strong> {formatDate(lead.created_at)}</div>
                <div><strong>Updated:</strong> {formatDate(lead.updated_at)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
