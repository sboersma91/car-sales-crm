import { supabaseServer } from '../../lib/supabase-server'
import Link from 'next/link'

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

      {leads?.map((lead) => (
        <div key={lead.id} style={{ marginBottom: '20px' }}>
          <Link href={`/leads/${lead.id}`}>
            {lead.first_name} {lead.last_name}
          </Link>
          <br />
          Email: {lead.email}<br />
          Phone: {lead.phone}<br />
          <hr />
        </div>
      ))}
    </div>
  )
}
