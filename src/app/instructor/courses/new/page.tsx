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

const GRADE_LEVELS: Record<string, string[]> = {
  BIOLOGY: ['9th Grade', '10th Grade'],
  PHYSICAL_SCIENCE: ['8th Grade'],
  CHEMISTRY: ['10th Grade'],
  MATHEMATICS: ['8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'],
}

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

function formatTime12h(time24: string): string {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
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
  // Per-day local times: { Monday: '09:00', Wednesday: '14:00' }
  const [dayTimes, setDayTimes] = useState<Record<string, string>>({})
  // Topics
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'BIOLOGY',
    gradeLevel: '9th Grade',
    durationWeeks: '',
    sessionDurationMins: '',
    feeUsd: '',
    contentUrl: '',
  })

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        setDayTimes((dt) => { const next = { ...dt }; delete next[day]; return next })
        return prev.filter((d) => d !== day)
      } else {
        setDayTimes((dt) => ({ ...dt, [day]: '' }))
        return [...prev, day]
      }
    })
  }

  const set =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const addTopic = () => {
    const t = topicInput.trim()
    if (t && !topics.includes(t)) {
      setTopics((prev) => [...prev, t])
      setTopicInput('')
    }
  }

  const removeTopic = (t: string) => setTopics((prev) => prev.filter((x) => x !== t))

  // Build schedule for submission and display
  const buildSchedule = () =>
    DAYS.filter((d) => selectedDays.includes(d)).map((day) => ({
      day,
      localTime: dayTimes[day] || '',
      utcTime: localTimeToUtc(dayTimes[day] || '', timezone),
    }))

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (courseType === 'LIVE') {
      if (selectedDays.length === 0) { setError('Select at least one class day.'); return }
      const missingTime = selectedDays.find((d) => !dayTimes[d])
      if (missingTime) { setError(`Please set a start time for ${missingTime}.`); return }
    }
    if (courseType === 'SELF_PACED' && !form.contentUrl) {
      setError('Please provide a content URL for the self-paced course.'); return
    }

    setLoading(true)
    setError('')

    const schedule = buildSchedule()
    // Use first day's UTC time as startTimeUtc for reminder cron compatibility
    const startTimeUtc = schedule.length > 0 ? schedule[0].utcTime : ''
    const scheduleJson = courseType === 'LIVE' ? JSON.stringify(schedule) : ''

    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        courseType,
        gradeLevel: form.gradeLevel,
        daysOfWeek: courseType === 'LIVE' ? selectedDays : [],
        startTimeUtc,
        topics,
        scheduleJson,
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
                { value: 'LIVE', label: 'Live Class', desc: 'Scheduled sessions with students via Google Meet' },
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

          {/* Topics */}
          <div>
            <label style={labelStyle}>Topics Covered</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTopic() } }}
                placeholder="e.g. Cell Division, Genetics, DNA Replication..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={addTopic}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: '#003d35',
                  border: '1px solid #00C2A8',
                  color: '#00C2A8',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                + Add
              </button>
            </div>
            {topics.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {topics.map((t) => (
                  <span
                    key={t}
                    style={{
                      backgroundColor: '#0a2240',
                      border: '1px solid #1e3a5f',
                      borderRadius: '6px',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.8rem',
                      color: '#a8c4e0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTopic(t)}
                      style={{ background: 'none', border: 'none', color: '#6b88a8', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.375rem' }}>
              Add each topic and press Enter or click + Add. Students will see this list before enrolling.
            </p>
          </div>

          {/* Subject + Grade Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Subject</label>
              <select
                value={form.subject}
                onChange={(e) => {
                  const newSubject = e.target.value
                  const grades = GRADE_LEVELS[newSubject] || []
                  setForm((f) => ({ ...f, subject: newSubject, gradeLevel: grades[0] || '' }))
                }}
                style={inputStyle}
              >
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Grade Level</label>
              <select value={form.gradeLevel} onChange={set('gradeLevel')} style={inputStyle}>
                {(GRADE_LEVELS[form.subject] || []).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              {/* Class Days */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Class Days</label>
                  {selectedDays.length > 0 && (
                    <span style={{
                      backgroundColor: '#1a2d4a',
                      color: '#F5C842',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {selectedDays.length} meeting{selectedDays.length !== 1 ? 's' : ''} per week
                    </span>
                  )}
                </div>
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

              {/* Per-day start times */}
              {selectedDays.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Class Start Times</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#6b88a8', fontSize: '0.75rem' }}>Timezone:</span>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        style={{ ...inputStyle, width: 'auto', padding: '0.375rem 0.625rem', fontSize: '0.8rem' }}
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {DAYS.filter((d) => selectedDays.includes(d)).map((day) => {
                      const localT = dayTimes[day] || ''
                      const utcT = localT ? localTimeToUtc(localT, timezone) : ''
                      return (
                        <div
                          key={day}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr auto',
                            gap: '0.75rem',
                            alignItems: 'center',
                            backgroundColor: '#060f1a',
                            border: '1px solid #1e3a5f',
                            borderRadius: '8px',
                            padding: '0.625rem 0.875rem',
                          }}
                        >
                          <span style={{ color: '#e8edf5', fontSize: '0.875rem', fontWeight: 600 }}>{day}</span>
                          <input
                            type="time"
                            value={localT}
                            onChange={(e) => setDayTimes((dt) => ({ ...dt, [day]: e.target.value }))}
                            style={{ ...inputStyle, padding: '0.4rem 0.625rem' }}
                          />
                          {utcT && (
                            <span style={{ color: '#6b88a8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                              UTC {utcT}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                    Set a different start time for each day. Times are stored in UTC and shown to students in their local timezone.
                  </p>
                </div>
              )}

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

              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#0a2240', borderRadius: '8px', border: '1px solid #1e3a5f' }}>
                <p style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Google Meet link auto-generated</p>
                <p style={{ color: '#6b88a8', fontSize: '0.75rem' }}>A Google Meet link will be automatically created and shared with students when your course is approved.</p>
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
