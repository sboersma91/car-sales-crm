import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default async function LeadsPage() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading leads</div>
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1>Leads</h1>

  

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