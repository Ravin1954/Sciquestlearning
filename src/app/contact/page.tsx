'use client'

import { useState } from 'react'
import NavBar from '@/components/NavBar'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  backgroundColor: '#EEF3F8',
  border: '1px solid #C5D5E4',
  color: '#0B1A2E',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  color: '#2d4a6b',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginBottom: '0.375rem',
  display: 'block',
}

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'Student', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, name: `${form.firstName} ${form.lastName}`.trim() }),
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ firstName: '', lastName: '', email: '', role: 'Student', message: '' })
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#EEF3F8', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#0B1A2E', marginBottom: '0.5rem' }}>
          Contact Us
        </h1>
        <p style={{ color: '#5a7a96', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Have a question or need help? Send us a message and we&apos;ll get back to you as soon as possible.
        </p>

        {success ? (
          <div style={{ backgroundColor: '#003d35', border: '1px solid #00C2A8', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#00C2A8', fontFamily: 'Fraunces, serif', marginBottom: '0.5rem' }}>Message Sent!</h2>
            <p style={{ color: '#2d4a6b' }}>Thank you for reaching out. We&apos;ll reply to your email shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="First name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Last name"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter your email"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>I am a</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={inputStyle}
              >
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Parent">Parent</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Message</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your message here..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {error && (
              <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#004d42' : '#00C2A8',
                color: '#0B1A2E',
                padding: '0.875rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Sending...' : 'Send Message →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
