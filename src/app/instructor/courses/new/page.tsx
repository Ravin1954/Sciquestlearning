'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SUBJECTS = [
  { value: 'BIOLOGY', label: 'Biology' },
  { value: 'PHYSICAL_SCIENCE', label: 'Physical Science' },
  { value: 'CHEMISTRY', label: 'Chemistry' },
  { value: 'MATHEMATICS', label: 'Mathematics' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  backgroundColor: '#060f1a',
  border: '1px solid #1e3a5f',
  color: '#e8edf5',
  fontSize: '0.875rem',
  fontFamily: "'DM Sans', sans-serif",
}

const labelStyle: React.CSSProperties = {
  color: '#a8c4e0',
  fontSize: '0.875rem',
  fontWeight: 600,
  display: 'block',
  marginBottom: '0.5rem',
}

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'BIOLOGY',
    durationWeeks: '',
    startTimeUtc: '',
    sessionDurationMins: '',
    feeUsd: '',
  })

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDays.length === 0) { setError('Select at least one day'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, daysOfWeek: selectedDays }),
    })

    if (res.ok) {
      router.push('/instructor')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create course')
    }
    setLoading(false)
  }

  return (
    <DashboardLayout role="instructor">
      <div style={{ maxWidth: '680px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' }}>
          Create New Course
        </h1>
        <p style={{ color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Your course will be submitted for admin review before going live.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Course Title</label>
            <input required value={form.title} onChange={set('title')} placeholder="e.g. Introduction to Cell Biology" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea required value={form.description} onChange={set('description')} rows={4}
              placeholder="Describe what students will learn, prerequisites, and course structure..."
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Subject</label>
              <select value={form.subject} onChange={set('subject')} style={inputStyle}>
                {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Duration (weeks)</label>
              <input required type="number" min="1" max="52" value={form.durationWeeks} onChange={set('durationWeeks')} placeholder="e.g. 8" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Days of the Week</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: selectedDays.includes(day) ? '1px solid #00C2A8' : '1px solid #1e3a5f',
                    backgroundColor: selectedDays.includes(day) ? '#003d35' : '#060f1a',
                    color: selectedDays.includes(day) ? '#00C2A8' : '#6b88a8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Start Time (UTC, 24h format)</label>
              <input required type="time" value={form.startTimeUtc} onChange={set('startTimeUtc')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Session Duration (minutes)</label>
              <input required type="number" min="30" max="180" value={form.sessionDurationMins} onChange={set('sessionDurationMins')} placeholder="e.g. 60" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Course Fee (USD)</label>
            <input required type="number" min="1" step="0.01" value={form.feeUsd} onChange={set('feeUsd')} placeholder="e.g. 149.00" style={inputStyle} />
            <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.375rem' }}>
              You receive 80% (${ form.feeUsd ? (parseFloat(form.feeUsd) * 0.8).toFixed(2) : '0.00' }) · Platform fee 20%
            </p>
          </div>

          {error && (
            <p style={{ color: '#f87171', backgroundColor: '#3d0f0f', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? '#005040' : '#00C2A8', color: '#0B1A2E', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Submitting...' : 'Submit for Review →'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ backgroundColor: 'transparent', color: '#6b88a8', padding: '0.875rem 1.5rem', borderRadius: '10px', fontWeight: 600, fontSize: '1rem', border: '1px solid #1e3a5f', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
