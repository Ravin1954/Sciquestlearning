'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import NavBar from '@/components/NavBar'

interface Session { day: string; date: string; utcTime: string; label: string }
interface SessionGroup { date: string; day: string; dateLabel: string; sessions: Session[] }

interface ScheduleEntry {
  day: string
  date?: string
  week?: number
  utcTime?: string
  utcTimes?: string[]
  localTime?: string
  localTimes?: string[]
}

interface Course {
  id: string
  title: string
  description: string
  subject: string
  courseType: string
  feeType?: string
  startDate?: string
  durationWeeks: number
  durationUnit?: string
  daysOfWeek: string[]
  startTimeUtc: string
  scheduleJson: string
  sessionDurationMins: number
  feeUsd: number
  topics: string[]
  status: string
  recordingsJson?: string
  cancelledSessionsJson?: string
  instructor: { firstName: string; lastName: string; qualifications?: string }
}

const subjectColors: Record<string, string> = {
  BIOLOGY: '#22c55e',
  PHYSICAL_SCIENCE: '#3b82f6',
  CHEMISTRY: '#a855f7',
  MATHEMATICS: '#f59e0b',
}

const subjectLabels: Record<string, string> = {
  BIOLOGY: 'Biology',
  PHYSICAL_SCIENCE: 'Physical Science',
  CHEMISTRY: 'Chemistry',
  MATHEMATICS: 'Mathematics',
}

const DAY_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
}

function nextDateForDay(dayName: string): Date {
  const today = new Date()
  const todayDay = today.getDay()
  const target = DAY_INDEX[dayName] ?? 0
  let diff = target - todayDay
  if (diff <= 0) diff += 7
  const result = new Date(today)
  result.setDate(today.getDate() + diff)
  return result
}

function formatUtcTime(utc: string) {
  if (!utc) return utc
  const [h, m] = utc.split(':').map(Number)
  const date = new Date()
  date.setUTCHours(h, m, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function CoursePageClient() {
  const { id } = useParams<{ id: string }>()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionGroups, setSessionGroups] = useState<SessionGroup[]>([])
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [enrolledSessions, setEnrolledSessions] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${id}`).then((r) => r.json()),
      fetch(`/api/courses/${id}/my-sessions`).then((r) => r.json()).catch(() => ({ enrolledSessions: [] })),
    ]).then(([data, myData]) => {
      setCourse(data)
      const alreadyEnrolled: string[] = myData.enrolledSessions || []
      setEnrolledSessions(new Set(alreadyEnrolled))

      if (data.scheduleJson) {
        try {
          const schedule: ScheduleEntry[] = JSON.parse(data.scheduleJson)
          const parsed: Session[] = []
          const groups: SessionGroup[] = []
          const todayMidnight = new Date()
          todayMidnight.setHours(0, 0, 0, 0)
          schedule.forEach((entry) => {
            // Filter out past dates
            if (entry.date) {
              const entryDate = new Date(entry.date + 'T00:00:00')
              if (entryDate < todayMidnight) return
            }
            const times = entry.utcTimes || (entry.utcTime ? [entry.utcTime] : [])
            const dateKey = entry.date || entry.day
            const dateLabel = entry.date
              ? new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              : entry.day
            const groupSessions: Session[] = times.map((t) => ({
              day: entry.day,
              date: dateKey,
              utcTime: t,
              label: `${dateLabel} — ${formatUtcTime(t)}`,
            }))
            parsed.push(...groupSessions)
            if (times.length > 0) {
              groups.push({ date: dateKey, day: entry.day, dateLabel, sessions: groupSessions })
            }
          })
          setSessions(parsed)
          setSessionGroups(groups)
          // For lump sum: auto-select the first time slot for every day
          if (data.feeType === 'LUMP_SUM') {
            const autoSelected = new Set(groups.map((g) => g.sessions[0].label))
            setSelectedSessions(autoSelected)
          }
        } catch { /* ignore */ }
      }
      setLoading(false)
    })
  }, [id])

  const toggleSession = (label: string) => {
    setSelectedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const selectAll = () => setSelectedSessions(new Set(sessions.filter((s) => !enrolledSessions.has(s.label)).map((s) => s.label)))
  const clearAll = () => setSelectedSessions(new Set())

  const feePerSession = course ? Number(course.feeUsd) : 0
  const sessionCount = selectedSessions.size
  const totalFee = (course?.feeType === 'LUMP_SUM') ? feePerSession : feePerSession * sessionCount

  const handleEnroll = async () => {
    if (!isSignedIn) { router.push('/sign-in'); return }
    if (course?.courseType === 'LIVE' && sessions.length > 0 && sessionCount === 0) {
      setError('Please select at least one session to enroll.')
      return
    }
    setEnrolling(true)
    setError('')
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: id,
        selectedSessions: Array.from(selectedSessions),
      }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error || 'Failed to start checkout')
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
        <NavBar />
        <div style={{ textAlign: 'center', padding: '6rem', color: '#6b88a8' }}>Loading...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
        <NavBar />
        <div style={{ textAlign: 'center', padding: '6rem', color: '#6b88a8' }}>Course not found.</div>
      </div>
    )
  }

  const color = subjectColors[course.subject] || '#00C2A8'
  const durationLabel = course.durationUnit === 'DAYS'
    ? `${course.durationWeeks} day${course.durationWeeks !== 1 ? 's' : ''}`
    : `${course.durationWeeks} week${course.durationWeeks !== 1 ? 's' : ''}`

  const isLive = course.courseType === 'LIVE'
  const hasSessions = sessions.length > 0
  const isLumpSum = course.feeType === 'LUMP_SUM'

  return (
    <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          {/* Main Content */}
          <div>
            <span style={{ backgroundColor: color + '22', color, padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {subjectLabels[course.subject] || course.subject}
            </span>

            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#e8edf5', margin: '1rem 0 0.5rem' }}>
              {course.title}
            </h1>

            <p style={{ color: '#6b88a8', marginBottom: '2rem' }}>
              Taught by <span style={{ color: '#a8c4e0' }}>{course.instructor.firstName} {course.instructor.lastName}</span>
            </p>

            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1.125rem', marginBottom: '0.875rem' }}>About This Course</h2>
              <p style={{ color: '#a8c4e0', lineHeight: 1.7 }}>{course.description}</p>
            </div>

            {course.topics && course.topics.length > 0 && (
              <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1.125rem', marginBottom: '0.875rem' }}>Topics Covered</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {course.topics.map((topic) => (
                    <span key={topic} style={{ backgroundColor: '#0a2240', border: '1px solid #1e3a5f', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.8rem', color: '#a8c4e0' }}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Session Picker for LIVE courses */}
            {isLive && hasSessions && (
              <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1.125rem' }}>
                    {isLumpSum ? 'Course Schedule' : 'Select Your Sessions'}
                  </h2>
                  {!isLumpSum && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={selectAll} type="button" style={{ background: 'none', border: '1px solid #1e3a5f', color: '#00C2A8', borderRadius: '5px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Select All
                      </button>
                      <button onClick={clearAll} type="button" style={{ background: 'none', border: '1px solid #1e3a5f', color: '#6b88a8', borderRadius: '5px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '0.875rem' }}>
                  {isLumpSum
                    ? <>One flat fee of <strong style={{ color: '#F5C842' }}>${feePerSession.toFixed(2)}</strong> covers the entire course. Select the sessions you plan to attend.</>
                    : <>Each session is <strong style={{ color: '#F5C842' }}>${feePerSession.toFixed(2)}</strong>. Select sessions and pay now, or come back later to add more.</>
                  }
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {sessionGroups.map((g, gi) => {
                    const cancelledKeys: string[] = (() => { try { return JSON.parse(course.cancelledSessionsJson || '[]') } catch { return [] } })()
                    const anySelected = g.sessions.some((s) => selectedSessions.has(s.label))
                    return (
                      <div
                        key={gi}
                        style={{
                          backgroundColor: anySelected ? '#003d35' : '#060f1a',
                          border: `1px solid ${anySelected ? '#00C2A8' : '#1e3a5f'}`,
                          borderRadius: '8px',
                          padding: '0.625rem 0.875rem',
                        }}
                      >
                        <p style={{ color: '#a8c4e0', fontSize: '0.825rem', fontWeight: 600, marginBottom: g.sessions.length > 1 ? '0.5rem' : 0 }}>
                          {g.dateLabel}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: g.sessions.length > 1 ? 0 : '0.25rem' }}>
                          {g.sessions.map((s) => {
                            const isCancelled = cancelledKeys.some((k) => { const [kDay, kTime] = k.split('|'); return s.day === kDay && s.utcTime === kTime })
                            const alreadyPaid = enrolledSessions.has(s.label)
                            const isSelected = selectedSessions.has(s.label)
                            if (isLumpSum) {
                              return (
                                <label key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: (isCancelled || alreadyPaid) ? 'default' : 'pointer', opacity: isCancelled ? 0.5 : 1 }}>
                                  <input
                                    type="radio"
                                    name={`session-${gi}`}
                                    checked={isSelected || alreadyPaid}
                                    disabled={isCancelled}
                                    onChange={() => {
                                      setSelectedSessions((prev) => {
                                        const next = new Set(prev)
                                        g.sessions.forEach((gs) => next.delete(gs.label))
                                        next.add(s.label)
                                        return next
                                      })
                                    }}
                                    style={{ accentColor: '#00C2A8' }}
                                  />
                                  <span style={{ color: alreadyPaid ? '#22c55e' : isSelected ? '#00C2A8' : '#6b88a8', fontSize: '0.825rem', fontWeight: (isSelected || alreadyPaid) ? 600 : 400 }}>
                                    {formatUtcTime(s.utcTime)}{isCancelled ? ' (Cancelled)' : alreadyPaid ? ' ✓' : ''}
                                  </span>
                                </label>
                              )
                            }
                            // Per-session: checkbox per time slot
                            return (
                              <label key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: (isCancelled || alreadyPaid) ? 'default' : 'pointer', opacity: isCancelled ? 0.5 : 1 }}>
                                <input
                                  type="checkbox"
                                  checked={alreadyPaid || isSelected}
                                  disabled={alreadyPaid || isCancelled}
                                  onChange={() => !alreadyPaid && !isCancelled && toggleSession(s.label)}
                                  style={{ accentColor: alreadyPaid ? '#22c55e' : '#00C2A8', width: '15px', height: '15px' }}
                                />
                                <span style={{ color: isCancelled ? '#f87171' : alreadyPaid ? '#22c55e' : isSelected ? '#00C2A8' : '#6b88a8', fontSize: '0.825rem', fontWeight: (isSelected || alreadyPaid) ? 600 : 400 }}>
                                  {formatUtcTime(s.utcTime)}{isCancelled ? ' (Cancelled)' : alreadyPaid ? ' ✓ Paid' : ` — $${feePerSession.toFixed(2)}`}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {sessionCount > 0 && (
                  <div style={{ marginTop: '0.875rem', padding: '0.75rem', backgroundColor: '#0a2240', borderRadius: '8px', border: '1px solid #1e3a5f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#a8c4e0', fontSize: '0.875rem' }}>
                      {isLumpSum ? 'Full course fee' : `${sessionCount} session${sessionCount !== 1 ? 's' : ''} selected`}
                    </span>
                    <span style={{ color: '#F5C842', fontWeight: 700, fontSize: '1.1rem' }}>${totalFee.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Schedule info */}
            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1.125rem', marginBottom: '0.875rem' }}>Course Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {isLive && hasSessions ? (
                  // Dynamic start date: earliest selected session day, or course startDate if none selected
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b88a8', fontSize: '0.875rem' }}>Start Date</span>
                    <span style={{ color: '#e8edf5', fontSize: '0.875rem', fontWeight: 500 }}>
                      {(() => {
                        const selected = sessions.filter(s => selectedSessions.has(s.label))
                        if (selected.length === 0 && course.startDate) {
                          return new Date(course.startDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        }
                        if (selected.length === 0) return '—'
                        const dates = selected.map(s => nextDateForDay(s.day))
                        const earliest = dates.reduce((a, b) => a < b ? a : b)
                        return earliest.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      })()}
                    </span>
                  </div>
                ) : course.startDate ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b88a8', fontSize: '0.875rem' }}>Start Date</span>
                    <span style={{ color: '#e8edf5', fontSize: '0.875rem', fontWeight: 500 }}>
                      {new Date(course.startDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b88a8', fontSize: '0.875rem' }}>Access</span>
                  <span style={{ color: '#e8edf5', fontSize: '0.875rem', fontWeight: 500 }}>
                    {isLive
                      ? sessionCount > 0
                        ? `${sessionCount} session${sessionCount !== 1 ? 's' : ''} selected`
                        : durationLabel
                      : 'Lifetime Access'}
                  </span>
                </div>
                {isLive && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b88a8', fontSize: '0.875rem' }}>Session Length</span>
                      <span style={{ color: '#e8edf5', fontSize: '0.875rem', fontWeight: 500 }}>{course.sessionDurationMins} minutes</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b88a8', fontSize: '0.875rem' }}>Total Sessions Available</span>
                      <span style={{ color: '#F5C842', fontSize: '0.875rem', fontWeight: 600 }}>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b88a8', fontSize: '0.875rem' }}>{isLumpSum ? 'Total Course Fee' : 'Fee per Session'}</span>
                      <span style={{ color: '#e8edf5', fontSize: '0.875rem', fontWeight: 500 }}>${feePerSession.toFixed(2)}{isLumpSum ? ' (flat fee)' : ''}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {course.instructor.qualifications && (
              <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1.125rem', marginBottom: '0.875rem' }}>About the Instructor</h2>
                <p style={{ color: '#a8c4e0', lineHeight: 1.7, fontSize: '0.9rem' }}>{course.instructor.qualifications}</p>
              </div>
            )}

            {/* Session Recordings — only for enrolled students */}
            {enrolledSessions.size > 0 && (() => {
              const recs: { label: string; url: string }[] = (() => { try { return JSON.parse(course.recordingsJson || '[]') } catch { return [] } })()
              if (recs.length === 0) return null
              return (
                <div style={{ backgroundColor: '#0f2240', border: '1px solid #a855f7', borderRadius: '12px', padding: '1.5rem', marginTop: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1.125rem', marginBottom: '0.875rem' }}>
                    📹 Session Recordings
                  </h2>
                  <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '0.875rem' }}>Available to enrolled students only.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {recs.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '0.625rem 0.875rem', textDecoration: 'none' }}>
                        <span style={{ color: '#e8edf5', fontSize: '0.875rem' }}>{r.label}</span>
                        <span style={{ color: '#a855f7', fontSize: '0.8rem', fontWeight: 600 }}>Watch →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Enrollment Card */}
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#F5C842', marginBottom: '0.1rem' }}>
                ${feePerSession.toFixed(2)}
                <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6b88a8' }}>
                  {isLumpSum ? ' full course' : ' / session'}
                </span>
              </p>

              {sessionCount > 0 && !isLumpSum && (
                <p style={{ color: '#00C2A8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {sessionCount} session{sessionCount !== 1 ? 's' : ''} → <strong>${totalFee.toFixed(2)}</strong> total
                </p>
              )}

              {enrolledSessions.size > 0 && (
                <p style={{ color: '#22c55e', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  ✓ {enrolledSessions.size} session{enrolledSessions.size !== 1 ? 's' : ''} already paid
                </p>
              )}
              <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                {isLive && hasSessions
                  ? enrolledSessions.size > 0 ? 'Select more sessions to add' : 'Select sessions above then enroll'
                  : 'One-time fee — lifetime access'}
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ color: '#6b88a8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Accepted payments
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {['Visa', 'Mastercard', 'Amex', 'Discover', 'Apple Pay', 'Google Pay'].map((method) => (
                    <span key={method} style={{ backgroundColor: '#060f1a', border: '1px solid #1e3a5f', borderRadius: '5px', padding: '0.25rem 0.55rem', fontSize: '0.72rem', fontWeight: 600, color: '#a8c4e0' }}>
                      {method}
                    </span>
                  ))}
                </div>
              </div>

              {error && (
                <p style={{ color: '#f87171', backgroundColor: '#3d0f0f', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleEnroll}
                disabled={enrolling || (isLive && hasSessions && sessionCount === 0)}
                style={{
                  width: '100%',
                  backgroundColor: enrolling ? '#005040' : (isLive && hasSessions && sessionCount === 0) ? '#1e3a5f' : '#00C2A8',
                  color: (isLive && hasSessions && sessionCount === 0) ? '#6b88a8' : '#0B1A2E',
                  border: 'none',
                  padding: '0.875rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: (enrolling || (isLive && hasSessions && sessionCount === 0)) ? 'not-allowed' : 'pointer',
                  marginBottom: '0.75rem',
                }}
              >
                {enrolling
                  ? 'Redirecting to Checkout...'
                  : !isSignedIn
                    ? 'Sign In to Enroll →'
                    : isLive && hasSessions && sessionCount === 0
                      ? 'Select Sessions Above'
                      : isLumpSum && sessionCount > 0
                        ? `Enroll — Pay $${totalFee.toFixed(2)} →`
                        : sessionCount > 0
                          ? `Enroll in ${sessionCount} Session${sessionCount !== 1 ? 's' : ''} →`
                          : 'Enroll Now →'}
              </button>

              <p style={{ textAlign: 'center', color: '#6b88a8', fontSize: '0.75rem', marginBottom: '1rem' }}>
                Secured by Stripe — your payment info is never stored on our servers
              </p>

              <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Live Google Meet sessions', 'Email reminders 20 min before class', 'Direct access to your instructor', 'Google Meet link sent on enrollment'].map((benefit) => (
                  <div key={benefit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#00C2A8', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
