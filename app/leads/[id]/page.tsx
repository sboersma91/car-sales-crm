import { supabaseServer } from '../../../lib/supabase-server'
import Link from 'next/link'

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

  return (
    <div style={{ padding: '40px' }}>
      <Link href="/leads">Back to leads</Link>
      <h1>Lead Detail</h1>

      <p><strong>Name:</strong> {lead.first_name} {lead.last_name}</p>
      <p><strong>Email:</strong> {lead.email}</p>
      <p><strong>Phone:</strong> {lead.phone}</p>
    </div>
  )
}