'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload from '@/components/ImageUpload'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SUBJECTS = [
  { value: 'BIOLOGY', label: 'Biology' },
  { value: 'PHYSICAL_SCIENCE', label: 'Physical Science' },
  { value: 'CHEMISTRY', label: 'Chemistry' },
  { value: 'MATHEMATICS', label: 'Mathematics' },
]

const GRADE_LEVELS: Record<string, string[]> = {
  BIOLOGY: ['Middle School', 'High School'],
  PHYSICAL_SCIENCE: ['Middle School', 'High School'],
  CHEMISTRY: ['Middle School', 'High School'],
  MATHEMATICS: ['Middle School', 'High School'],
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

const DAY_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
}

type Session = { day: string; date: string; week: number }

function nextDateForDay(dayName: string): string {
  const target = DAY_INDEX[dayName]
  const today = new Date()
  const todayDay = today.getDay()
  const diff = (target - todayDay + 7) % 7 || 7
  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  return next.toISOString().split('T')[0]
}

function generateAllSessions(days: string[], durationWeeks: number): Session[] {
  if (days.length === 0 || durationWeeks < 1) return []
  const sortedDays = DAYS.filter((d) => days.includes(d))
  const baseDates: Record<string, string> = {}
  sortedDays.forEach((day) => { baseDates[day] = nextDateForDay(day) })

  const sessions: Session[] = []
  for (let week = 1; week <= durationWeeks; week++) {
    sortedDays.forEach((day) => {
      const base = new Date(baseDates[day] + 'T00:00:00')
      base.setDate(base.getDate() + (week - 1) * 7)
      sessions.push({ day, date: base.toISOString().split('T')[0], week })
    })
  }
  return sessions
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

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
  backgroundColor: '#EEF3F8',
  border: '1px solid #C5D5E4',
  color: '#0B1A2E',
  fontSize: '0.875rem',
  fontFamily: "'DM Sans', sans-serif",
}

const labelStyle: React.CSSProperties = {
  color: '#2d4a6b',
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
  const [dayTimes, setDayTimes] = useState<Record<string, string[]>>({})
  const [sessions, setSessions] = useState<Session[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [durationUnit, setDurationUnit] = useState<'WEEKS' | 'DAYS'>('WEEKS')
  const [feeType, setFeeType] = useState<'PER_SESSION' | 'LUMP_SUM'>('PER_SESSION')
  const [imageUrl, setImageUrl] = useState('')
  const [bookedSlots, setBookedSlots] = useState<{ date: string; utcTime: string; courseTitle: string }[]>([])
  const [conflicts, setConflicts] = useState<{ date: string; utcTime: string; courseTitle: string }[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'BIOLOGY',
    gradeLevel: 'Middle School',
    durationWeeks: '',
    sessionDurationMins: '',
    feeUsd: '',
    contentUrl: '',
    classroomUrl: '',
    startDate: '',
  })

  // Fetch instructor's existing booked sessions for conflict detection
  useEffect(() => {
    fetch('/api/instructor/schedule')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setBookedSlots(data) })
      .catch(() => {})
  }, [])

  // Check for conflicts whenever sessions or times change
  useEffect(() => {
    if (bookedSlots.length === 0 || sessions.length === 0) { setConflicts([]); return }
    const found: { date: string; utcTime: string; courseTitle: string }[] = []
    const schedule = buildSchedule()
    for (const s of schedule) {
      for (const ut of s.utcTimes) {
        if (!ut) continue
        const clash = bookedSlots.find((b) => b.date === s.date && b.utcTime === ut)
        if (clash && !found.find((f) => f.date === clash.date && f.utcTime === clash.utcTime)) {
          found.push(clash)
        }
      }
    }
    setConflicts(found)
  }, [sessions, dayTimes, timezone, bookedSlots])

  // Auto-generate full session schedule whenever days or duration changes
  useEffect(() => {
    const weeks = parseInt(form.durationWeeks) || 0
    if (selectedDays.length > 0 && weeks >= 1) {
      const newSessions = generateAllSessions(selectedDays, weeks)
      setSessions(newSessions)
      const earliest = newSessions.map((s) => s.date).sort()[0] || ''
      setForm((f) => ({ ...f, startDate: earliest }))
    } else {
      setSessions([])
      setForm((f) => ({ ...f, startDate: '' }))
    }
  }, [selectedDays, form.durationWeeks])

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        setDayTimes((dt) => { const n = { ...dt }; delete n[day]; return n })
        return prev.filter((d) => d !== day)
      } else {
        setDayTimes((dt) => ({ ...dt, [day]: [''] }))
        return [...prev, day]
      }
    })
  }

  const updateSessionDate = (week: number, day: string, newDate: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.week === week && s.day === day ? { ...s, date: newDate } : s))
    )
    // Keep startDate in sync with earliest session
    setSessions((prev) => {
      const earliest = prev.map((s) => (s.week === week && s.day === day ? newDate : s.date)).filter(Boolean).sort()[0] || ''
      setForm((f) => ({ ...f, startDate: earliest }))
      return prev
    })
  }

  const addTimeSlot = (day: string) => {
    setDayTimes((dt) => ({ ...dt, [day]: [...(dt[day] || []), ''] }))
  }

  const removeTimeSlot = (day: string, idx: number) => {
    setDayTimes((dt) => {
      const times = dt[day].filter((_, i) => i !== idx)
      return { ...dt, [day]: times.length > 0 ? times : [''] }
    })
  }

  const updateTimeSlot = (day: string, idx: number, value: string) => {
    setDayTimes((dt) => {
      const times = [...(dt[day] || [])]
      times[idx] = value
      return { ...dt, [day]: times }
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

  const buildSchedule = () =>
    sessions.map((session) => {
      const times = (dayTimes[session.day] || ['']).filter(Boolean)
      return {
        day: session.day,
        date: session.date,
        week: session.week,
        localTimes: times,
        utcTimes: times.map((t) => localTimeToUtc(t, timezone)),
      }
    })

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (courseType === 'LIVE') {
      if (selectedDays.length === 0) { setError('Select at least one class day.'); return }
      if (!form.durationWeeks || parseInt(form.durationWeeks) < 1) { setError('Please enter a valid duration.'); return }
      const missingTime = selectedDays.find((d) => !dayTimes[d] || dayTimes[d].every((t) => !t))
      if (missingTime) { setError(`Please set at least one start time for ${missingTime}.`); return }
    }
    if (courseType === 'SELF_PACED' && !form.contentUrl) {
      setError('Please provide a content URL for the self-paced course.'); return
    }
    if (form.contentUrl && !form.contentUrl.startsWith('http://') && !form.contentUrl.startsWith('https://')) {
      setError('Content URL must start with https:// (e.g. https://drive.google.com/...)'); return
    }

    setLoading(true)
    setError('')

    const schedule = buildSchedule()
    const startTimeUtc = schedule.length > 0 && schedule[0].utcTimes.length > 0 ? schedule[0].utcTimes[0] : ''
    const scheduleJson = courseType === 'LIVE' ? JSON.stringify(schedule) : ''

    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        courseType,
        durationUnit,
        feeType,
        gradeLevel: form.gradeLevel,
        daysOfWeek: courseType === 'LIVE' ? selectedDays : [],
        startTimeUtc,
        topics,
        scheduleJson,
        startDate: form.startDate,
        classroomUrl: form.classroomUrl || null,
        imageUrl: imageUrl || null,
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

  // Group sessions by week for display
  const weekNumbers = Array.from(new Set(sessions.map((s) => s.week))).sort((a, b) => a - b)
  const totalSessions = sessions.length

  return (
    <DashboardLayout role="instructor">
      <div style={{ maxWidth: '680px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0B1A2E', marginBottom: '0.25rem' }}>
          Create New Course
        </h1>
        <p style={{ color: '#5a7a96', fontSize: '0.9rem', marginBottom: '2rem' }}>
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
                    border: courseType === opt.value ? '2px solid #00C2A8' : '1px solid #C5D5E4',
                    backgroundColor: courseType === opt.value ? '#E0F7F4' : '#FFFFFF',
                    color: courseType === opt.value ? '#00C2A8' : '#5a7a96',
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

          {/* Course Image */}
          <ImageUpload value={imageUrl} onChange={setImageUrl} label="Course Image" />

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
                  backgroundColor: '#E0F7F4',
                  border: '1px solid #00A896',
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
                      backgroundColor: '#EEF3F8',
                      border: '1px solid #C5D5E4',
                      borderRadius: '6px',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.8rem',
                      color: '#2d4a6b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTopic(t)}
                      style={{ background: 'none', border: 'none', color: '#5a7a96', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p style={{ color: '#5a7a96', fontSize: '0.75rem', marginTop: '0.375rem' }}>
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

          {/* LIVE-only scheduling fields */}
          {courseType === 'LIVE' && (
            <>
              {/* Class Days */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Class Days (per week)</label>
                  {selectedDays.length > 0 && (
                    <span style={{
                      backgroundColor: '#1a2d4a',
                      color: '#F5C842',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} per week
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
                        border: selectedDays.includes(day) ? '1px solid #00C2A8' : '1px solid #C5D5E4',
                        backgroundColor: selectedDays.includes(day) ? '#E0F7F4' : '#FFFFFF',
                        color: selectedDays.includes(day) ? '#00C2A8' : '#5a7a96',
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

              {/* Duration */}
              <div>
                <label style={labelStyle}>Course Duration</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  {(['WEEKS', 'DAYS'] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setDurationUnit(unit)}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        border: durationUnit === unit ? '1px solid #00C2A8' : '1px solid #C5D5E4',
                        backgroundColor: durationUnit === unit ? '#E0F7F4' : '#FFFFFF',
                        color: durationUnit === unit ? '#00C2A8' : '#5a7a96',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {unit === 'WEEKS' ? 'Weeks' : 'Days'}
                    </button>
                  ))}
                </div>
                <input
                  required
                  type="number"
                  min="1"
                  max={durationUnit === 'WEEKS' ? 52 : 365}
                  value={form.durationWeeks}
                  onChange={set('durationWeeks')}
                  placeholder={durationUnit === 'WEEKS' ? 'e.g. 4' : 'e.g. 1'}
                  style={inputStyle}
                />
                {selectedDays.length > 0 && parseInt(form.durationWeeks) >= 1 && (
                  <p style={{ color: '#00C2A8', fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: 600 }}>
                    {totalSessions} total session{totalSessions !== 1 ? 's' : ''} — {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''}/week × {form.durationWeeks} week{parseInt(form.durationWeeks) !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Full Session Schedule */}
              {sessions.length > 0 && (
                <div>
                  <label style={labelStyle}>Full Session Schedule</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {weekNumbers.map((weekNum) => (
                      <div key={weekNum}>
                        <div style={{
                          color: '#F5C842',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.4rem',
                          paddingLeft: '0.25rem',
                        }}>
                          Week {weekNum}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {sessions.filter((s) => s.week === weekNum).map((session) => (
                            <div
                              key={`${session.week}-${session.day}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                backgroundColor: '#EEF3F8',
                                border: '1px solid #C5D5E4',
                                borderRadius: '8px',
                                padding: '0.5rem 0.875rem',
                              }}
                            >
                              <span style={{ color: '#2d4a6b', fontSize: '0.8rem', fontWeight: 600, width: '90px', flexShrink: 0 }}>
                                {session.day}
                              </span>
                              <input
                                type="date"
                                value={session.date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => updateSessionDate(session.week, session.day, e.target.value)}
                                style={{ ...inputStyle, flex: 1, colorScheme: 'light', padding: '0.35rem 0.625rem' }}
                              />
                              {session.date && (
                                <span style={{ color: '#00C2A8', fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                  {formatDate(session.date)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: '#5a7a96', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    Dates are auto-generated from today. You can adjust any date (e.g. to skip a holiday).
                  </p>
                </div>
              )}

              {/* Per-day start times */}
              {selectedDays.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Class Start Times</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#5a7a96', fontSize: '0.75rem' }}>Timezone:</span>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {DAYS.filter((d) => selectedDays.includes(d)).map((day) => {
                      const times = dayTimes[day] || ['']
                      return (
                        <div
                          key={day}
                          style={{
                            backgroundColor: '#EEF3F8',
                            border: '1px solid #C5D5E4',
                            borderRadius: '8px',
                            padding: '0.75rem 0.875rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#0B1A2E', fontSize: '0.875rem', fontWeight: 600 }}>{day}</span>
                            <button
                              type="button"
                              onClick={() => addTimeSlot(day)}
                              style={{ background: 'none', border: '1px solid #C5D5E4', color: '#00C2A8', borderRadius: '5px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              + Add time
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {times.map((t, idx) => {
                              const utcT = t ? localTimeToUtc(t, timezone) : ''
                              return (
                                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', alignItems: 'center' }}>
                                  <input
                                    type="time"
                                    value={t}
                                    onChange={(e) => updateTimeSlot(day, idx, e.target.value)}
                                    style={{ ...inputStyle, padding: '0.4rem 0.625rem' }}
                                  />
                                  {utcT && <span style={{ color: '#5a7a96', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>UTC {utcT}</span>}
                                  {times.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeTimeSlot(day, idx)}
                                      style={{ background: 'none', border: 'none', color: '#5a7a96', cursor: 'pointer', fontSize: '1rem', padding: '0 0.25rem' }}
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ color: '#5a7a96', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                    Set one or more start times per day. The same time applies to all weeks.
                  </p>
                </div>
              )}

              <div>
                <label style={labelStyle}>Session Duration (minutes)</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="480"
                  value={form.sessionDurationMins}
                  onChange={set('sessionDurationMins')}
                  placeholder="e.g. 40"
                  style={inputStyle}
                />
              </div>

              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#EEF3F8', borderRadius: '8px', border: '1px solid #C5D5E4' }}>
                <p style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Google Meet link auto-generated</p>
                <p style={{ color: '#5a7a96', fontSize: '0.75rem' }}>A Google Meet link will be automatically created and shared with students when your course is approved.</p>
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
              <p style={{ color: '#5a7a96', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                Paste a link to your course content (Google Drive folder, YouTube playlist, etc.). Only enrolled students will see this link.
              </p>
            </div>
          )}

          {/* Google Classroom URL */}
          <div>
            <label style={labelStyle}>Google Classroom Link <span style={{ color: '#5a7a96', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="url"
              value={form.classroomUrl}
              onChange={set('classroomUrl')}
              placeholder="https://classroom.google.com/c/..."
              style={inputStyle}
            />
            <p style={{ color: '#5a7a96', fontSize: '0.75rem', marginTop: '0.375rem' }}>
              If you use Google Classroom for materials and assignments, paste the invite link here. Students will receive it in their enrollment email.
            </p>
          </div>

          {/* Fee */}
          <div>
            <label style={labelStyle}>Course Fee</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
              {([
                { value: 'PER_SESSION', label: 'Per Session', desc: 'Students pay per session they attend' },
                { value: 'LUMP_SUM', label: 'Lump Sum', desc: 'One flat fee covers the entire course' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFeeType(opt.value)}
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.75rem',
                    borderRadius: '8px',
                    border: feeType === opt.value ? '1px solid #00C2A8' : '1px solid #C5D5E4',
                    backgroundColor: feeType === opt.value ? '#E0F7F4' : '#FFFFFF',
                    color: feeType === opt.value ? '#00C2A8' : '#5a7a96',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.15rem' }}>{opt.label}</p>
                  <p style={{ fontSize: '0.7rem', color: feeType === opt.value ? '#00a88f' : '#4a6080' }}>{opt.desc}</p>
                </button>
              ))}
            </div>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.feeUsd}
              onChange={set('feeUsd')}
              placeholder={feeType === 'PER_SESSION' ? 'Enter fee per session' : 'Enter total course fee'}
              style={inputStyle}
            />
            {form.feeUsd !== '' && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem' }}>
                {parseFloat(form.feeUsd) === 0 ? (
                  <p style={{ color: '#F5C842', fontSize: '0.75rem', fontWeight: 600 }}>Free course — students enroll at no charge</p>
                ) : (
                  <>
                    <p style={{ color: '#00C2A8', fontSize: '0.75rem' }}>
                      You receive: <strong>${(parseFloat(form.feeUsd) * 0.8).toFixed(2)}</strong> (80%)
                      {feeType === 'PER_SESSION' ? ' per session' : ' of full course fee'}
                    </p>
                    <p style={{ color: '#5a7a96', fontSize: '0.75rem' }}>
                      Platform: ${(parseFloat(form.feeUsd) * 0.2).toFixed(2)} (20%)
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {conflicts.length > 0 && (
            <div style={{ backgroundColor: '#3d2a00', border: '1px solid #F5C842', borderRadius: '8px', padding: '0.875rem 1rem' }}>
              <p style={{ color: '#F5C842', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                ⚠ Schedule Conflict Detected
              </p>
              {conflicts.map((c, i) => (
                <p key={i} style={{ color: '#fde68a', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  • {new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — already booked for <strong>{c.courseTitle}</strong>
                </p>
              ))}
              <p style={{ color: '#fde68a', fontSize: '0.775rem', marginTop: '0.5rem', opacity: 0.8 }}>
                You can still submit, but please adjust the dates to avoid overlapping classes.
              </p>
            </div>
          )}

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
                color: '#5a7a96',
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid #C5D5E4',
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
