'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase.ts'

export default function Home() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.from('leads').insert([form])

    if (error) {
      console.error(error)
      alert('Error saving lead')
      alert(error.message)
    } else {
      alert('Lead saved!')
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
      })
    }
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1>Lead Capture</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}