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
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
]

function localTimeToUtc(localTime: string, timezone: string): string {
  if (!localTime) return ''
  const [hours, minutes] = localTime.split(':').map(Number)
  const today = new Date()
  const dateStr = `${today.toISOString().split('T')[0]}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00Z`
  const tempUTC = new Date(dateStr)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(tempUTC)
  const tzHour = parseInt(parts.find((p) => p.type === 'hour')!.value)
  const tzMin = parseInt(parts.find((p) => p.type === 'minute')!.value)
  const diffMins = (hours * 60 + minutes) - (tzHour * 60 + tzMin)
  const utcMs = tempUTC.getTime() + diffMins * 60_000
  const utcDate = new Date(utcMs)
  return `${String(utcDate.getUTCHours()).padStart(2, '0')}:${String(utcDate.getUTCMinutes()).padStart(2, '0')}`
}

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
  const [courseType, setCourseType] = useState<'LIVE' | 'SELF_PACED'>('LIVE')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [timezone, setTimezone] = useState('America/New_York')
  const [localTime, setLocalTime] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'BIOLOGY',
    durationWeeks: '',
    sessionDurationMins: '',
    feeUsd: '',
    contentUrl: '',
  })

  const toggleDay = (day: string) =>
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )

  const set =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const utcPreview = localTime ? localTimeToUtc(localTime, timezone) : null

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (courseType === 'LIVE') {
      if (selectedDays.length === 0) { setError('Select at least one day.'); return }
      if (!localTime) { setError('Please set a class start time.'); return }
    }
    if (courseType === 'SELF_PACED' && !form.contentUrl) {
      setError('Please provide a content URL for the self-paced course.'); return
    }

    setLoading(true)
    setError('')

    const startTimeUtc = courseType === 'LIVE' ? localTimeToUtc(localTime, timezone) : ''

    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        courseType,
        daysOfWeek: courseType === 'LIVE' ? selectedDays : [],
        startTimeUtc,
      }),
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

          {/* Course Type Toggle */}
          <div>
            <label style={labelStyle}>Course Type</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[
                { value: 'LIVE', label: 'Live Class', desc: 'Scheduled sessions with students via Zoom' },
                { value: 'SELF_PACED', label: 'Self-Paced', desc: 'Students learn at their own time via your content link' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCourseType(opt.value as 'LIVE' | 'SELF_PACED')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '10px',
                    border: courseType === opt.value ? '2px solid #00C2A8' : '1px solid #1e3a5f',
                    backgroundColor: courseType === opt.value ? '#003d35' : '#060f1a',
                    color: courseType === opt.value ? '#00C2A8' : '#6b88a8',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{opt.label}</p>
                  <p style={{ fontSize: '0.75rem', color: courseType === opt.value ? '#00a88f' : '#4a6080', lineHeight: 1.4 }}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Course Title</label>
            <input
              required
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. Introduction to Cell Biology"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Course Description</label>
            <textarea
              required
              value={form.description}
              onChange={set('description')}
              rows={4}
              placeholder="Describe what students will learn, prerequisites, and course structure..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Subject + Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Subject</label>
              <select value={form.subject} onChange={set('subject')} style={inputStyle}>
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Duration (weeks)</label>
              <input
                required
                type="number"
                min="1"
                max="52"
                value={form.durationWeeks}
                onChange={set('durationWeeks')}
                placeholder="e.g. 8"
                style={inputStyle}
              />
            </div>
          </div>

          {/* LIVE-only fields */}
          {courseType === 'LIVE' && (
            <>
              <div>
                <label style={labelStyle}>Class Days</label>
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

              <div>
                <label style={labelStyle}>Class Start Time</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginBottom: '0.375rem' }}>Your timezone</p>
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={inputStyle}>
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginBottom: '0.375rem' }}>Local start time</p>
                    <input
                      required
                      type="time"
                      value={localTime}
                      onChange={(e) => setLocalTime(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
                {utcPreview && (
                  <div style={{ marginTop: '0.625rem', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#00C2A8', fontSize: '0.75rem', fontWeight: 700 }}>UTC</span>
                    <span style={{ color: '#e8edf5', fontSize: '0.875rem', fontWeight: 600 }}>{utcPreview}</span>
                    <span style={{ color: '#6b88a8', fontSize: '0.75rem' }}>— stored as UTC, displayed in each student&apos;s local timezone</span>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Session Duration (minutes)</label>
                <input
                  required
                  type="number"
                  min="30"
                  max="180"
                  step="15"
                  value={form.sessionDurationMins}
                  onChange={set('sessionDurationMins')}
                  placeholder="e.g. 60"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {/* SELF_PACED-only fields */}
          {courseType === 'SELF_PACED' && (
            <div>
              <label style={labelStyle}>Content URL</label>
              <input
                required
                type="url"
                value={form.contentUrl}
                onChange={set('contentUrl')}
                placeholder="e.g. https://drive.google.com/... or https://youtube.com/..."
                style={inputStyle}
              />
              <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                Paste a link to your course content (Google Drive folder, YouTube playlist, etc.). Only enrolled students will see this link.
              </p>
            </div>
          )}

          {/* Fee */}
          <div>
            <label style={labelStyle}>Course Fee (USD)</label>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              value={form.feeUsd}
              onChange={set('feeUsd')}
              placeholder="e.g. 149.00"
              style={inputStyle}
            />
            {form.feeUsd && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem' }}>
                <p style={{ color: '#00C2A8', fontSize: '0.75rem' }}>
                  You receive: <strong>${(parseFloat(form.feeUsd) * 0.8).toFixed(2)}</strong> (80%)
                </p>
                <p style={{ color: '#6b88a8', fontSize: '0.75rem' }}>
                  Platform fee: ${(parseFloat(form.feeUsd) * 0.2).toFixed(2)} (20%)
                </p>
              </div>
            )}
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
              style={{
                backgroundColor: loading ? '#005040' : '#00C2A8',
                color: '#0B1A2E',
                padding: '0.875rem 2rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Submitting...' : 'Submit for Review →'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                backgroundColor: 'transparent',
                color: '#6b88a8',
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid #1e3a5f',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
