'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import StatusBadge from '@/components/StatusBadge'

interface Course {
  id: string
  title: string
  subject: string
  courseType: 'LIVE' | 'SELF_PACED'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  feeUsd: number
  durationWeeks: number
  daysOfWeek: string[]
  startTimeUtc: string
  sessionDurationMins: number
  zoomJoinUrl?: string
  zoomStartUrl?: string
  contentUrl?: string
  topics: string[]
  recordingsJson?: string
  rejectionRemark?: string | null
  _count: { enrollments: number }
}

const DAY_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
}

function formatLocalTime(utcTime: string): string {
  if (!utcTime) return ''
  const [h, m] = utcTime.split(':').map(Number)
  const d = new Date()
  d.setUTCHours(h, m, 0, 0)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' })
}

function minutesUntilNextSession(daysOfWeek: string[], startTimeUtc: string): number {
  if (!daysOfWeek.length || !startTimeUtc) return Infinity
  const [h, m] = startTimeUtc.split(':').map(Number)
  const now = new Date()
  const nowUtcMins = now.getUTCHours() * 60 + now.getUTCMinutes()
  const sessionMins = h * 60 + m
  const todayDay = now.getUTCDay()
  let minDiff = Infinity
  for (const day of daysOfWeek) {
    const target = DAY_INDEX[day] ?? -1
    if (target < 0) continue
    let dayDiff = target - todayDay
    if (dayDiff < 0) dayDiff += 7
    const totalMins = dayDiff * 1440 + (sessionMins - nowUtcMins)
    if (totalMins < minDiff) minDiff = totalMins
  }
  return minDiff
}

function nextSessionLabel(daysOfWeek: string[], startTimeUtc: string): string {
  if (!daysOfWeek.length || !startTimeUtc) return ''
  const [h, m] = startTimeUtc.split(':').map(Number)
  const now = new Date()
  const todayDay = now.getUTCDay()
  let minDiff = Infinity
  for (const day of daysOfWeek) {
    const target = DAY_INDEX[day] ?? -1
    if (target < 0) continue
    let dayDiff = target - todayDay
    if (dayDiff <= 0) dayDiff += 7
    if (dayDiff < minDiff) minDiff = dayDiff
  }
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + minDiff)
  d.setUTCHours(h, m, 0, 0)
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' at ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

const S = {
  card: { backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' },
  sub: { color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' },
  h2: { fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#e8edf5', marginBottom: '1rem' },
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [recordingCourseId, setRecordingCourseId] = useState<string | null>(null)
  const [recordingLabel, setRecordingLabel] = useState('')
  const [recordingUrl, setRecordingUrl] = useState('')
  const [recordingSaving, setRecordingSaving] = useState(false)
  const [rosterCourseId, setRosterCourseId] = useState<string | null>(null)
  const [rosterData, setRosterData] = useState<{ studentName: string; email: string; enrolledAt: string }[]>([])
  const [rosterLoading, setRosterLoading] = useState(false)

  const handleViewRoster = async (courseId: string) => {
    if (rosterCourseId === courseId) { setRosterCourseId(null); return }
    setRosterCourseId(courseId)
    setRosterLoading(true)
    const res = await fetch(`/api/instructor/courses/${courseId}/roster`)
    const data = await res.json()
    setRosterData(Array.isArray(data) ? data : [])
    setRosterLoading(false)
  }

  useEffect(() => {
    fetch('/api/instructor/courses')
      .then((r) => r.json())
      .then((c) => { setCourses(c); setLoading(false) })
  }, [])

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) return
    setDeleteLoading(courseId)
    setDeleteError(null)
    const res = await fetch(`/api/instructor/courses/${courseId}`, { method: 'DELETE' })
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
    } else {
      const d = await res.json()
      setDeleteError(d.error || 'Failed to delete')
    }
    setDeleteLoading(null)
  }

  const approved = courses.filter((c) => c.status === 'APPROVED')
  const rejected = courses.filter((c) => c.status === 'REJECTED')

  return (
    <DashboardLayout role="instructor">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={S.h1}>My Courses</h1>
          <p style={S.sub}>All your submitted and active courses</p>
        </div>
        <Link
          href="/instructor/courses/new"
          style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}
        >
          + Create Course
        </Link>
      </div>

      {loading ? <p style={{ color: '#6b88a8' }}>Loading...</p> : (
        <>
          {/* Upcoming Classes */}
          {approved.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={S.h2}>Upcoming Classes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {approved.map((c) => {
                  const minsUntil = c.courseType === 'LIVE' ? minutesUntilNextSession(c.daysOfWeek, c.startTimeUtc) : Infinity
                  const isClassTime = minsUntil <= 30 && minsUntil >= -60 && c._count.enrollments > 0
                  const nextLabel = c.courseType === 'LIVE' && !isClassTime ? nextSessionLabel(c.daysOfWeek, c.startTimeUtc) : ''
                  const meetLink = c.zoomJoinUrl || c.zoomStartUrl
                  return (
                    <div key={c.id} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderColor: isClassTime ? '#00C2A8' : '#1e3a5f' }}>
                      <div>
                        <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.25rem' }}>{c.title}</p>
                        <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>
                          {c.daysOfWeek.join(', ')} · {formatLocalTime(c.startTimeUtc)} · {c.sessionDurationMins} min · {c._count.enrollments} students
                        </p>
                        {nextLabel && (
                          <p style={{ color: '#F5C842', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            Next session: {nextLabel}
                          </p>
                        )}
                        {isClassTime && (
                          <p style={{ color: '#00C2A8', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                            🟢 Class is live now!
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {c._count.enrollments > 0 && (
                          <button
                            onClick={() => handleViewRoster(c.id)}
                            style={{ backgroundColor: 'transparent', color: '#F5C842', border: '1px solid #F5C842', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {rosterCourseId === c.id ? 'Hide Roster' : `Roster (${c._count.enrollments})`}
                          </button>
                        )}
                        {c.courseType === 'SELF_PACED' ? (
                          c.contentUrl ? (
                            <a href={c.contentUrl.startsWith('http') ? c.contentUrl : `https://${c.contentUrl}`} target="_blank" rel="noopener noreferrer"
                              style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                              Course Materials →
                            </a>
                          ) : (
                            <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>No content URL</span>
                          )
                        ) : meetLink ? (
                          <a href={meetLink.startsWith('http') ? meetLink : `https://${meetLink}`} target="_blank" rel="noopener noreferrer"
                            style={{ backgroundColor: isClassTime ? '#00C2A8' : '#1e3a5f', color: isClassTime ? '#0B1A2E' : '#6b88a8', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                            {isClassTime ? 'Start Class →' : 'Open Meet Link'}
                          </a>
                        ) : (
                          <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>Meeting link pending</span>
                        )}
                      </div>
                    </div>

                    {/* Roster panel */}
                    {rosterCourseId === c.id && (
                      <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <p style={{ color: '#F5C842', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                          Enrolled Students — verify names against Google Meet waiting room
                        </p>
                        {rosterLoading ? (
                          <p style={{ color: '#6b88a8', fontSize: '0.85rem' }}>Loading roster...</p>
                        ) : rosterData.length === 0 ? (
                          <p style={{ color: '#6b88a8', fontSize: '0.85rem' }}>No students enrolled.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {rosterData.map((s, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '0.6rem 1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ color: '#e8edf5', fontWeight: 600, fontSize: '0.875rem' }}>{s.studentName}</span>
                                <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>{s.email}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
                          Admit students whose name in Google Meet matches the student name above. If they appear as "Guest", ask them to re-join and type their child's name.
                        </p>
                      </div>
                    )}
                  </div>
                )
                })}
              </div>
            </div>
          )}

          {/* Action Required — Rejected */}
          {rejected.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ ...S.h2, color: '#f87171' }}>
                Action Required
                <span style={{ backgroundColor: '#f87171', color: '#fff', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', fontWeight: 700, marginLeft: '0.75rem' }}>
                  {rejected.length} rejected
                </span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {rejected.map((c) => (
                  <div key={c.id} style={{ ...S.card, border: '1px solid #7f1d1d' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: c.rejectionRemark ? '0.75rem' : 0 }}>
                      <div>
                        <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.25rem' }}>{c.title}</p>
                        <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>
                          {c.subject.replace('_', ' ')} · {c.durationWeeks} weeks · ${Number(c.feeUsd).toFixed(2)}
                        </p>
                      </div>
                      <Link
                        href={`/instructor/courses/${c.id}/edit`}
                        style={{ backgroundColor: '#F5C842', color: '#0B1A2E', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                      >
                        Edit &amp; Resubmit →
                      </Link>
                    </div>
                    {c.rejectionRemark && (
                      <div style={{ backgroundColor: '#3d0f0f', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '0.75rem' }}>
                        <p style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Admin remarks</p>
                        <p style={{ color: '#fca5a5', fontSize: '0.875rem', lineHeight: 1.6 }}>{c.rejectionRemark}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Courses */}
          <div>
            <h2 style={S.h2}>All Courses</h2>
            {deleteError && (
              <p style={{ color: '#f87171', backgroundColor: '#3d0f0f', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{deleteError}</p>
            )}
            {courses.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', color: '#6b88a8', padding: '3rem' }}>
                No courses yet.{' '}
                <Link href="/instructor/courses/new" style={{ color: '#00C2A8' }}>Create your first course →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {courses.map((c) => (
                  <div key={c.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.25rem' }}>{c.title}</p>
                        <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>
                          {c.subject.replace('_', ' ')} · ${Number(c.feeUsd).toFixed(2)} · {c._count.enrollments} enrolled
                        </p>
                        {c.topics && c.topics.length > 0 && (
                          <ol style={{ margin: '0.5rem 0 0 1rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {c.topics.map((topic, i) => (
                              <li key={i} style={{ color: '#a8c4e0', fontSize: '0.8rem' }}>{topic}</li>
                            ))}
                          </ol>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <StatusBadge status={c.status} />
                        {c.status === 'APPROVED' && (
                          <button
                            onClick={() => setRecordingCourseId(recordingCourseId === c.id ? null : c.id)}
                            style={{ backgroundColor: 'transparent', color: '#a855f7', border: '1px solid #a855f7', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            📹 Recordings
                          </button>
                        )}
                        <Link
                          href={`/instructor/courses/${c.id}/edit`}
                          style={{ backgroundColor: 'transparent', color: '#a8c4e0', border: '1px solid #1e3a5f', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}
                        >
                          Edit
                        </Link>
                        {c._count.enrollments === 0 && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deleteLoading === c.id}
                            style={{ backgroundColor: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', opacity: deleteLoading === c.id ? 0.5 : 1 }}
                          >
                            {deleteLoading === c.id ? '...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Recordings panel */}
                    {recordingCourseId === c.id && (() => {
                      const recs: { label: string; url: string }[] = (() => { try { return JSON.parse(c.recordingsJson || '[]') } catch { return [] } })()
                      return (
                        <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '1rem', marginTop: '0.5rem' }}>
                          <p style={{ color: '#a855f7', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>📹 Session Recordings</p>
                          {recs.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                              {recs.map((r, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '0.5rem 0.875rem' }}>
                                  <div>
                                    <span style={{ color: '#e8edf5', fontSize: '0.8rem', fontWeight: 600 }}>{r.label}</span>
                                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', fontSize: '0.75rem', marginLeft: '0.75rem', textDecoration: 'none' }}>View →</a>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const updated = recs.filter((_, idx) => idx !== i)
                                      await fetch(`/api/instructor/courses/${c.id}/recordings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordingsJson: JSON.stringify(updated) }) })
                                      setCourses((prev) => prev.map((x) => x.id === c.id ? { ...x, recordingsJson: JSON.stringify(updated) } : x))
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}
                                  >Remove</button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <input
                              placeholder="Label (e.g. Apr 12 — Cell Biology)"
                              value={recordingLabel}
                              onChange={(e) => setRecordingLabel(e.target.value)}
                              style={{ flex: 1, minWidth: '180px', padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.8rem' }}
                            />
                            <input
                              placeholder="Google Drive / YouTube link"
                              value={recordingUrl}
                              onChange={(e) => setRecordingUrl(e.target.value)}
                              style={{ flex: 2, minWidth: '220px', padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.8rem' }}
                            />
                            <button
                              disabled={recordingSaving || !recordingLabel.trim() || !recordingUrl.trim()}
                              onClick={async () => {
                                setRecordingSaving(true)
                                const updated = [...recs, { label: recordingLabel.trim(), url: recordingUrl.trim() }]
                                await fetch(`/api/instructor/courses/${c.id}/recordings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordingsJson: JSON.stringify(updated) }) })
                                setCourses((prev) => prev.map((x) => x.id === c.id ? { ...x, recordingsJson: JSON.stringify(updated) } : x))
                                setRecordingLabel('')
                                setRecordingUrl('')
                                setRecordingSaving(false)
                              }}
                              style={{ backgroundColor: '#a855f7', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', opacity: (!recordingLabel.trim() || !recordingUrl.trim()) ? 0.5 : 1 }}
                            >
                              {recordingSaving ? 'Saving...' : '+ Add'}
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
