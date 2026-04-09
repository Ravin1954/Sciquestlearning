'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

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

export default function EditCoursePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [courseStatus, setCourseStatus] = useState<string>('')
  const [rejectionRemark, setRejectionRemark] = useState<string | null>(null)
  const [courseType, setCourseType] = useState<'LIVE' | 'SELF_PACED'>('LIVE')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [timezone, setTimezone] = useState('America/New_York')
  const [dayTimes, setDayTimes] = useState<Record<string, string[]>>({})
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [durationUnit, setDurationUnit] = useState<'WEEKS' | 'DAYS'>('WEEKS')
  const [feeType, setFeeType] = useState<'PER_SESSION' | 'LUMP_SUM'>('PER_SESSION')

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'BIOLOGY',
    gradeLevel: 'Middle School',
    durationWeeks: '',
    sessionDurationMins: '',
    feeUsd: '',
    contentUrl: '',
    startDate: '',
  })

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((course) => {
        if (!course || course.error) {
          router.push('/instructor')
          return
        }
        setCourseStatus(course.status || '')
        setCourseType(course.courseType || 'LIVE')
        setSelectedDays(course.daysOfWeek || [])
        setTopics(course.topics || [])
        setRejectionRemark(course.rejectionRemark || null)
        setDurationUnit(course.durationUnit === 'DAYS' ? 'DAYS' : 'WEEKS')
        setFeeType(course.feeType === 'LUMP_SUM' ? 'LUMP_SUM' : 'PER_SESSION')
        setForm({
          title: course.title || '',
          description: course.description || '',
          subject: course.subject || 'BIOLOGY',
          gradeLevel: course.gradeLevel || '',
          durationWeeks: course.durationWeeks?.toString() || '',
          sessionDurationMins: course.sessionDurationMins?.toString() || '',
          feeUsd: Number(course.feeUsd).toFixed(2),
          contentUrl: course.contentUrl || '',
          startDate: course.startDate || '',
        })
        // Pre-fill day times from scheduleJson
        if (course.scheduleJson) {
          try {
            const schedule = JSON.parse(course.scheduleJson)
            const dt: Record<string, string[]> = {}
            schedule.forEach((entry: { day: string; localTime?: string; localTimes?: string[] }) => {
              // Support both old (localTime) and new (localTimes) formats
              dt[entry.day] = entry.localTimes || (entry.localTime ? [entry.localTime] : [''])
            })
            setDayTimes(dt)
          } catch { /* ignore */ }
        }
        setFetching(false)
      })
  }, [id, router])

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        setDayTimes((dt) => { const next = { ...dt }; delete next[day]; return next })
        return prev.filter((d) => d !== day)
      } else {
        setDayTimes((dt) => ({ ...dt, [day]: [''] }))
        return [...prev, day]
      }
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
    DAYS.filter((d) => selectedDays.includes(d)).map((day) => {
      const times = (dayTimes[day] || ['']).filter(Boolean)
      return {
        day,
        localTimes: times,
        utcTimes: times.map((t) => localTimeToUtc(t, timezone)),
      }
    })

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (courseType === 'LIVE') {
      if (selectedDays.length === 0) { setError('Select at least one class day.'); return }
      const missingTime = selectedDays.find((d) => !dayTimes[d] || dayTimes[d].every((t) => !t))
      if (missingTime) { setError(`Please set at least one start time for ${missingTime}.`); return }
    }
    if (courseType === 'SELF_PACED' && !form.contentUrl) {
      setError('Please provide a content URL for the self-paced course.'); return
    }

    setLoading(true)
    setError('')

    const schedule = buildSchedule()
    const startTimeUtc = schedule.length > 0 && schedule[0].utcTimes.length > 0 ? schedule[0].utcTimes[0] : ''
    const scheduleJson = courseType === 'LIVE' ? JSON.stringify(schedule) : ''

    const res = await fetch(`/api/instructor/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        courseType,
        durationUnit,
        feeType,
        daysOfWeek: courseType === 'LIVE' ? selectedDays : [],
        startTimeUtc,
        topics,
        scheduleJson,
        startDate: form.startDate,
      }),
    })

    if (res.ok) {
      router.push('/instructor')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to update course')
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <DashboardLayout role="instructor">
        <p style={{ color: '#6b88a8' }}>Loading...</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="instructor">
      <div style={{ maxWidth: '680px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' }}>
          Edit Course
        </h1>
        <p style={{ color: '#6b88a8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {courseStatus === 'APPROVED'
            ? 'Editing an approved course will send it back for admin review.'
            : 'Make your changes and resubmit for admin review.'}
        </p>

        {rejectionRemark && (
          <div style={{ backgroundColor: '#3d0f0f', border: '1px solid #7f1d1d', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Admin remarks</p>
            <p style={{ color: '#fca5a5', fontSize: '0.875rem', lineHeight: 1.6 }}>{rejectionRemark}</p>
          </div>
        )}

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
            <input required value={form.title} onChange={set('title')} placeholder="e.g. Introduction to Cell Biology" style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Course Description</label>
            <textarea required value={form.description} onChange={set('description')} rows={4} placeholder="Describe what students will learn..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* Topics */}
          <div>
            <label style={labelStyle}>Topics Covered</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTopic() } }}
                placeholder="e.g. Cell Division, Genetics..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" onClick={addTopic} style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', backgroundColor: '#003d35', border: '1px solid #00C2A8', color: '#00C2A8', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Add
              </button>
            </div>
            {topics.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {topics.map((t) => (
                  <span key={t} style={{ backgroundColor: '#0a2240', border: '1px solid #1e3a5f', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.8rem', color: '#a8c4e0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {t}
                    <button type="button" onClick={() => removeTopic(t)} style={{ background: 'none', border: 'none', color: '#6b88a8', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Subject + Grade Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Subject</label>
              <select value={form.subject} onChange={(e) => { const s = e.target.value; const grades = GRADE_LEVELS[s] || []; setForm((f) => ({ ...f, subject: s, gradeLevel: grades[0] || '' })) }} style={inputStyle}>
                {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Grade Level</label>
              <select value={form.gradeLevel} onChange={set('gradeLevel')} style={inputStyle}>
                {(GRADE_LEVELS[form.subject] || []).map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Duration — hidden for self-paced (lifetime access) */}
          {courseType === 'LIVE' && <div>
            <label style={labelStyle}>Duration</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
              {(['WEEKS', 'DAYS'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setDurationUnit(unit)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    border: durationUnit === unit ? '1px solid #00C2A8' : '1px solid #1e3a5f',
                    backgroundColor: durationUnit === unit ? '#003d35' : '#060f1a',
                    color: durationUnit === unit ? '#00C2A8' : '#6b88a8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {unit === 'WEEKS' ? 'Weeks' : 'Days'}
                </button>
              ))}
            </div>
            <input required type="number" min="1" max={durationUnit === 'WEEKS' ? 52 : 365} value={form.durationWeeks} onChange={set('durationWeeks')} placeholder={durationUnit === 'WEEKS' ? 'e.g. 8' : 'e.g. 1'} style={inputStyle} />
            <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.375rem' }}>
              {durationUnit === 'DAYS' && parseInt(form.durationWeeks) === 1 ? 'Single-day course' : `Number of ${durationUnit.toLowerCase()} the course runs`}
            </p>
          </div>}

          {/* Start Date — LIVE only */}
          {courseType === 'LIVE' && <div>
            <label style={labelStyle}>Course Start Date</label>
            <input
              required
              type="date"
              value={form.startDate}
              onChange={set('startDate')}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
            <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.375rem' }}>
              The date the first session takes place.
            </p>
          </div>}

          {/* LIVE fields */}
          {courseType === 'LIVE' && (
            <>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Class Days</label>
                  {selectedDays.length > 0 && (
                    <span style={{ backgroundColor: '#1a2d4a', color: '#F5C842', padding: '0.2rem 0.6rem', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {selectedDays.length} meeting{selectedDays.length !== 1 ? 's' : ''} per week
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {DAYS.map((day) => (
                    <button key={day} type="button" onClick={() => toggleDay(day)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: selectedDays.includes(day) ? '1px solid #00C2A8' : '1px solid #1e3a5f', backgroundColor: selectedDays.includes(day) ? '#003d35' : '#060f1a', color: selectedDays.includes(day) ? '#00C2A8' : '#6b88a8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDays.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Class Start Times</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#6b88a8', fontSize: '0.75rem' }}>Timezone:</span>
                      <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '0.375rem 0.625rem', fontSize: '0.8rem' }}>
                        {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {DAYS.filter((d) => selectedDays.includes(d)).map((day) => {
                      const times = dayTimes[day] || ['']
                      return (
                        <div key={day} style={{ backgroundColor: '#060f1a', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '0.75rem 0.875rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#e8edf5', fontSize: '0.875rem', fontWeight: 600 }}>{day}</span>
                            <button type="button" onClick={() => addTimeSlot(day)} style={{ background: 'none', border: '1px solid #1e3a5f', color: '#00C2A8', borderRadius: '5px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                              + Add time
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {times.map((t, idx) => (
                              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                                <input type="time" value={t} onChange={(e) => updateTimeSlot(day, idx, e.target.value)} style={{ ...inputStyle, padding: '0.4rem 0.625rem' }} />
                                {times.length > 1 && (
                                  <button type="button" onClick={() => removeTimeSlot(day, idx)} style={{ background: 'none', border: 'none', color: '#6b88a8', cursor: 'pointer', fontSize: '1rem', padding: '0 0.25rem' }}>×</button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                    Use &quot;+ Add time&quot; to add multiple sessions on the same day.
                  </p>
                </div>
              )}

              <div>
                <label style={labelStyle}>Session Duration (minutes)</label>
                <input required type="number" min="1" max="480" value={form.sessionDurationMins} onChange={set('sessionDurationMins')} placeholder="e.g. 40" style={inputStyle} />
              </div>
            </>
          )}

          {/* SELF_PACED fields */}
          {courseType === 'SELF_PACED' && (
            <div>
              <label style={labelStyle}>Content URL</label>
              <input required type="url" value={form.contentUrl} onChange={set('contentUrl')} placeholder="e.g. https://drive.google.com/..." style={inputStyle} />
            </div>
          )}

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
                    border: feeType === opt.value ? '1px solid #00C2A8' : '1px solid #1e3a5f',
                    backgroundColor: feeType === opt.value ? '#003d35' : '#060f1a',
                    color: feeType === opt.value ? '#00C2A8' : '#6b88a8',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.15rem' }}>{opt.label}</p>
                  <p style={{ fontSize: '0.7rem', color: feeType === opt.value ? '#00a88f' : '#4a6080' }}>{opt.desc}</p>
                </button>
              ))}
            </div>
            <input required type="number" min="0" step="0.01" value={form.feeUsd} onChange={set('feeUsd')} placeholder={feeType === 'PER_SESSION' ? 'Enter fee per session' : 'Enter total course fee'} style={inputStyle} />
            {form.feeUsd && parseFloat(form.feeUsd) > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem' }}>
                <p style={{ color: '#00C2A8', fontSize: '0.75rem' }}>You receive: <strong>${(parseFloat(form.feeUsd) * 0.8).toFixed(2)}</strong> (80%){feeType === 'PER_SESSION' ? ' per session' : ' of full course fee'}</p>
                <p style={{ color: '#6b88a8', fontSize: '0.75rem' }}>Platform: ${(parseFloat(form.feeUsd) * 0.2).toFixed(2)} (20%)</p>
              </div>
            )}
          </div>

          {error && (
            <p style={{ color: '#f87171', backgroundColor: '#3d0f0f', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? '#005040' : '#00C2A8', color: '#0B1A2E', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Saving...' : courseStatus === 'REJECTED' ? 'Resubmit for Review →' : 'Save Changes →'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/instructor')}
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
