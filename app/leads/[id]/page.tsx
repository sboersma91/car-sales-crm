import { supabase } from '../../../lib/supabase'

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  console.log('ID:', id)

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lead) {
    return <div>Lead not found</div>
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1>Lead Detail</h1>

      <p><strong>Name:</strong> {lead.first_name} {lead.last_name}</p>
      <p><strong>Email:</strong> {lead.email}</p>
      <p><strong>Phone:</strong> {lead.phone}</p>
    </div>
  )
}