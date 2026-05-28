'use client'

import { useState } from 'react'

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  vehicle_interest: '',
  notes: '',
}

export default function Home() {
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) {
      return
    }

    if (!form.first_name.trim()) {
      setMessage({ type: 'error', text: 'First name is required.' })
      return
    }

    if (!form.phone.trim() && !form.email.trim()) {
      setMessage({ type: 'error', text: 'Phone or email is required.' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          source: 'website_form',
        }),
      })

      const result = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        setMessage({ type: 'error', text: result?.error ?? 'Something went wrong.' })
        return
      }

      setMessage({ type: 'success', text: 'Lead submitted successfully.' })
      setForm(initialForm)
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '560px', padding: '40px', margin: '0 auto' }}>
      <h1>Lead Capture</h1>
      <p>Submit your info and our team will follow up.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
        <input
        name="first_name"
        placeholder="First Name"
        value={form.first_name}
        onChange={handleChange}
        />
        <input
          name="last_name"
          placeholder="Last Name (Optional)"
          value={form.last_name}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="vehicle_interest"
          placeholder="Vehicle Interest (Optional)"
          value={form.vehicle_interest}
          onChange={handleChange}
        />
        <textarea
          name="notes"
          placeholder="Notes (Optional)"
          value={form.notes}
          onChange={handleChange}
          rows={4}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Lead'}
        </button>
      </form>

      {message ? (
        <p style={{ marginTop: '16px', color: message.type === 'error' ? '#b00020' : '#0a7a31' }}>{message.text}</p>
      ) : null}
    </div>
  )
}
