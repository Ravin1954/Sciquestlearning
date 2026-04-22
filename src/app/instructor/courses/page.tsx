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
  scheduleJson?: string
  sessionDurationMins: number
  zoomJoinUrl?: string
  zoomStartUrl?: string
  contentUrl?: string
  topics: string[]
  recordingsJson?: string
  cancelledSessionsJson?: string | null
  rejectionRemark?: string | null
  _count: { enrollments: number }
}

function formatLocalTime(utcTime: string): string {
  if (!utcTime) return ''
  const [h, m] = utcTime.split(':').map(Number)
  const d = new Date()
  d.setUTCHours(h, m, 0, 0)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' })
}

interface ScheduleEntry {
  day: string
  date?: string
  utcTimes?: string[]
  utcTime?: string
}

// Find the next upcoming session from scheduleJson dated entries
function getNextSession(scheduleJson: string | undefined): { label: string; minsUntil: number } | null {
  if (!scheduleJson) return null
  try {
    const schedule: ScheduleEntry[] = JSON.parse(scheduleJson)
    const now = new Date()
    let nearest: { dt: Date; label: string } | null = null

    schedule.forEach((entry) => {
      if (!entry.date) return
      const times = entry.utcTimes || (entry.utcTime ? [entry.utcTime] : [])
      times.forEach((utcTime) => {
        const [h, m] = utcTime.split(':').map(Number)
        const dt = new Date(entry.date + 'T00:00:00Z')
        dt.setUTCHours(h, m, 0, 0)
        if (dt > now) {
          if (!nearest || dt < nearest.dt) {
            const localDt = new Date(dt)
            const dateLabel = localDt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
            const timeLabel = localDt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
            nearest = { dt, label: `${dateLabel} at ${timeLabel}` }
          }
        }
      })
    })
    if (!nearest) return null
    const minsUntil = Math.round(((nearest as { dt: Date }).dt.getTime() - now.getTime()) / 60000)
    return { label: (nearest as { label: string }).label, minsUntil }
  } catch {
    return null
  }
}

const S = {
  card: { backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0B1A2E', marginBottom: '0.25rem' },
  sub: { color: '#5a7a96', fontSize: '0.9rem', marginBottom: '2rem' },
  h2: { fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#0B1A2E', marginBottom: '1rem' },
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
  const [rosterData, setRosterData] = useState<{ enrollmentId: string; studentName: string; email: string; amountPaidUsd: number; enrolledAt: string }[]>([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [manageEnrollmentId, setManageEnrollmentId] = useState<string | null>(null)
  const [refundReason, setRefundReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundSubmitting, setRefundSubmitting] = useState(false)
  const [refundResult, setRefundResult] = useState<string | null>(null)
  const [msgSubject, setMsgSubject] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [msgAttachment, setMsgAttachment] = useState('')
  const [msgSending, setMsgSending] = useState(false)
  const [msgResult, setMsgResult] = useState<string | null>(null)

  const handleViewRoster = async (courseId: string) => {
    if (rosterCourseId === courseId) { setRosterCourseId(null); setMsgResult(null); return }
    setRosterCourseId(courseId)
    setRosterLoading(true)
    setMsgResult(null)
    const res = await fetch(`/api/instructor/courses/${courseId}/roster`)
    const data = await res.json()
    setRosterData(Array.isArray(data) ? data : [])
    setRosterLoading(false)
  }

  const handleSendMessage = async (courseId: string) => {
    if (!msgSubject.trim() || !msgBody.trim()) { setMsgResult('error:Please fill in the subject and message.'); return }
    setMsgSending(true)
    setMsgResult(null)
    const res = await fetch(`/api/instructor/courses/${courseId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: msgSubject, message: msgBody, attachmentUrl: msgAttachment || null }),
    })
    const data = await res.json()
    if (res.ok) {
      setMsgResult(`success:Message sent to ${data.sent} student${data.sent !== 1 ? 's' : ''}.`)
      setMsgSubject('')
      setMsgBody('')
      setMsgAttachment('')
    } else {
      setMsgResult(`error:${data.error || 'Failed to send.'}`)
    }
    setMsgSending(false)
  }

  const handleRefundRequest = async (courseId: string, enrollmentId: string) => {
    if (!refundReason.trim() || !refundAmount) { setRefundResult('error:Please fill in both reason and refund amount.'); return }
    setRefundSubmitting(true)
    setRefundResult(null)
    const res = await fetch(`/api/instructor/courses/${courseId}/refund-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, reason: refundReason, refundAmount: parseFloat(refundAmount) }),
    })
    const data = await res.json()
    if (res.ok) {
      setRefundResult('success:Refund request sent to SciQuest admin successfully.')
      setRefundReason('')
      setRefundAmount('')
      setManageEnrollmentId(null)
    } else {
      setRefundResult(`error:${data.error || 'Failed to send request.'}`)
    }
    setRefundSubmitting(false)
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
  const approvedLive = approved.filter((c) => c.courseType === 'LIVE')
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

      {loading ? <p style={{ color: '#5a7a96' }}>Loading...</p> : (
        <>
          {/* Upcoming Classes — Live only */}
          {approvedLive.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={S.h2}>Upcoming Classes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {approvedLive.map((c) => {
                  const nextSession = c.courseType === 'LIVE' ? getNextSession(c.scheduleJson) : null
                  const minsUntil = nextSession?.minsUntil ?? Infinity
                  const isClassTime = minsUntil <= 30 && minsUntil >= -60 && c._count.enrollments > 0
                  const nextLabel = nextSession && !isClassTime ? nextSession.label : ''
                  const meetLink = c.zoomJoinUrl || c.zoomStartUrl
                  return (
                    <div key={c.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '0.75rem', borderColor: isClassTime ? '#00C2A8' : '#C5D5E4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <p style={{ color: '#0B1A2E', fontWeight: 600, marginBottom: '0.25rem' }}>{c.title}</p>
                        <p style={{ color: '#5a7a96', fontSize: '0.8rem' }}>
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
                            <span style={{ color: '#5a7a96', fontSize: '0.8rem' }}>No content URL</span>
                          )
                        ) : meetLink ? (
                          <a href={meetLink.startsWith('http') ? meetLink : `https://${meetLink}`} target="_blank" rel="noopener noreferrer"
                            style={{ backgroundColor: isClassTime ? '#00C2A8' : '#C5D5E4', color: isClassTime ? '#0B1A2E' : '#5a7a96', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                            {isClassTime ? 'Start Class →' : 'Open Meet Link'}
                          </a>
                        ) : (
                          <span style={{ color: '#5a7a96', fontSize: '0.8rem' }}>Meeting link pending</span>
                        )}
                      </div>
                      </div>

                    {/* Roster panel */}
                    {rosterCourseId === c.id && (
                      <div style={{ borderTop: '1px solid #C5D5E4', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <p style={{ color: '#F5C842', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                          Enrolled Students — verify names against Google Meet waiting room
                        </p>
                        {rosterLoading ? (
                          <p style={{ color: '#5a7a96', fontSize: '0.85rem' }}>Loading roster...</p>
                        ) : rosterData.length === 0 ? (
                          <p style={{ color: '#5a7a96', fontSize: '0.85rem' }}>No students enrolled.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {rosterData.map((s, i) => (
                              <div key={i} style={{ backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', borderRadius: '8px', padding: '0.6rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  <div>
                                    <span style={{ color: '#0B1A2E', fontWeight: 600, fontSize: '0.875rem' }}>{s.studentName}</span>
                                    <span style={{ color: '#5a7a96', fontSize: '0.8rem', marginLeft: '0.75rem' }}>{s.email}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setManageEnrollmentId(manageEnrollmentId === s.enrollmentId ? null : s.enrollmentId)
                                      setRefundReason('')
                                      setRefundAmount('')
                                      setRefundResult(null)
                                    }}
                                    style={{ backgroundColor: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                  >
                                    {manageEnrollmentId === s.enrollmentId ? 'Close' : 'Manage Enrollment'}
                                  </button>
                                </div>

                                {manageEnrollmentId === s.enrollmentId && (
                                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #C5D5E4' }}>
                                    <p style={{ color: '#f87171', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.5rem' }}>Refund Request</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                      <div><span style={{ color: '#5a7a96' }}>Student: </span><span style={{ color: '#0B1A2E', fontWeight: 600 }}>{s.studentName}</span></div>
                                      <div><span style={{ color: '#5a7a96' }}>Amount Paid: </span><span style={{ color: '#0B1A2E', fontWeight: 600 }}>${s.amountPaidUsd.toFixed(2)}</span></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                      <textarea
                                        placeholder="Reason for refund (e.g. I was unable to teach on Apr 21 due to an emergency)"
                                        value={refundReason}
                                        onChange={(e) => setRefundReason(e.target.value)}
                                        rows={3}
                                        style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", resize: 'vertical' }}
                                      />
                                      <input
                                        type="number"
                                        placeholder="Refund amount (e.g. 12.50)"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        min="0"
                                        step="0.01"
                                        style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.8rem' }}
                                      />
                                      {refundResult && (
                                        <p style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', borderRadius: '6px', backgroundColor: refundResult.startsWith('success') ? '#003d35' : '#3d0f0f', color: refundResult.startsWith('success') ? '#00C2A8' : '#f87171' }}>
                                          {refundResult.replace(/^(success|error):/, '')}
                                        </p>
                                      )}
                                      <button
                                        onClick={() => handleRefundRequest(c.id, s.enrollmentId)}
                                        disabled={refundSubmitting}
                                        style={{ backgroundColor: '#f87171', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: refundSubmitting ? 'not-allowed' : 'pointer', opacity: refundSubmitting ? 0.6 : 1, alignSelf: 'flex-start' }}
                                      >
                                        {refundSubmitting ? 'Sending...' : 'Submit Refund Request to Admin'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <p style={{ color: '#5a7a96', fontSize: '0.75rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
                          Admit students whose name in Google Meet matches the student name above. If they appear as "Guest", ask them to re-join and type their child's name.
                        </p>

                        {/* Message Students */}
                        <div style={{ marginTop: '1.25rem', borderTop: '1px solid #C5D5E4', paddingTop: '1rem' }}>
                          <p style={{ color: '#00C2A8', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                            Message All Students
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <input
                              placeholder="Subject (e.g. Please review Chapter 3 before class)"
                              value={msgSubject}
                              onChange={(e) => setMsgSubject(e.target.value)}
                              style={{ padding: '0.6rem 0.875rem', borderRadius: '6px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.825rem', fontFamily: "'DM Sans', sans-serif" }}
                            />
                            <textarea
                              placeholder="Your message to students/parents..."
                              value={msgBody}
                              onChange={(e) => setMsgBody(e.target.value)}
                              rows={4}
                              style={{ padding: '0.6rem 0.875rem', borderRadius: '6px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.825rem', fontFamily: "'DM Sans', sans-serif", resize: 'vertical' }}
                            />
                            <input
                              placeholder="Attachment link (optional — Google Drive, PDF, etc.)"
                              value={msgAttachment}
                              onChange={(e) => setMsgAttachment(e.target.value)}
                              style={{ padding: '0.6rem 0.875rem', borderRadius: '6px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.825rem', fontFamily: "'DM Sans', sans-serif" }}
                            />
                            {msgResult && (
                              <p style={{
                                fontSize: '0.8rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                backgroundColor: msgResult.startsWith('success') ? '#003d35' : '#3d0f0f',
                                color: msgResult.startsWith('success') ? '#00C2A8' : '#f87171',
                              }}>
                                {msgResult.replace(/^(success|error):/, '')}
                              </p>
                            )}
                            <button
                              onClick={() => handleSendMessage(c.id)}
                              disabled={msgSending}
                              style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.825rem', cursor: msgSending ? 'not-allowed' : 'pointer', opacity: msgSending ? 0.6 : 1, alignSelf: 'flex-start' }}
                            >
                              {msgSending ? 'Sending...' : `Send to ${rosterData.length} Student${rosterData.length !== 1 ? 's' : ''}`}
                            </button>
                          </div>
                        </div>
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
                        <p style={{ color: '#0B1A2E', fontWeight: 600, marginBottom: '0.25rem' }}>{c.title}</p>
                        <p style={{ color: '#5a7a96', fontSize: '0.8rem' }}>
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
              <div style={{ ...S.card, textAlign: 'center', color: '#5a7a96', padding: '3rem' }}>
                No courses yet.{' '}
                <Link href="/instructor/courses/new" style={{ color: '#00C2A8' }}>Create your first course →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {courses.map((c) => (
                  <div key={c.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#0B1A2E', fontWeight: 600, marginBottom: '0.25rem' }}>{c.title}</p>
                        <p style={{ color: '#5a7a96', fontSize: '0.8rem' }}>
                          {c.subject.replace('_', ' ')} · ${Number(c.feeUsd).toFixed(2)} · {c._count.enrollments} enrolled
                        </p>
                        {c.topics && c.topics.length > 0 && (
                          <ol style={{ margin: '0.5rem 0 0 1rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {c.topics.map((topic, i) => (
                              <li key={i} style={{ color: '#2d4a6b', fontSize: '0.8rem' }}>{topic}</li>
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
                          style={{ backgroundColor: 'transparent', color: '#2d4a6b', border: '1px solid #C5D5E4', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}
                        >
                          Edit
                        </Link>
                        {c.cancelledSessionsJson && (() => { try { return JSON.parse(c.cancelledSessionsJson).length > 0 } catch { return false } })() && (
                          <Link
                            href={`/instructor/courses/${c.id}/edit`}
                            style={{ backgroundColor: 'transparent', color: '#F5C842', border: '1px solid #F5C842', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                          >
                            Reschedule
                          </Link>
                        )}
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
                        <div style={{ borderTop: '1px solid #C5D5E4', paddingTop: '1rem', marginTop: '0.5rem' }}>
                          <p style={{ color: '#a855f7', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>📹 Session Recordings</p>
                          {recs.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                              {recs.map((r, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', borderRadius: '8px', padding: '0.5rem 0.875rem' }}>
                                  <div>
                                    <span style={{ color: '#0B1A2E', fontSize: '0.8rem', fontWeight: 600 }}>{r.label}</span>
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
                              style={{ flex: 1, minWidth: '180px', padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.8rem' }}
                            />
                            <input
                              placeholder="Google Drive / YouTube link"
                              value={recordingUrl}
                              onChange={(e) => setRecordingUrl(e.target.value)}
                              style={{ flex: 2, minWidth: '220px', padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.8rem' }}
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
