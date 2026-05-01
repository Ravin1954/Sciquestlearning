'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatusBadge from '@/components/StatusBadge'

interface Instructor {
  id: string
  firstName: string
  lastName: string
  email: string
  country: string
  qualifications: string | null
  aboutMe: string | null
  certificatesUrl: string | null
  subjects: string[]
  instructorStatus: 'NOT_APPLICABLE' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
  rejectionRemark: string | null
  createdAt: string
  _count: { courses: number }
}

interface Metrics {
  totalStudents: number
  totalInstructors: number
  totalCourses: number
  pendingCourses: number
  totalEnrollments: number
  totalRevenue: number
  platformRevenue: number
}

interface Course {
  id: string
  title: string
  description: string
  subject: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  courseType: 'LIVE' | 'SELF_PACED'
  feeUsd: number
  feeType: string
  durationWeeks: number
  gradeLevel: string
  startDate: string
  daysOfWeek: string[]
  startTimeUtc: string
  sessionDurationMins: number
  scheduleJson: string
  contentUrl: string | null
  imageUrl: string | null
  topics: string[]
  zoomJoinUrl: string | null
  cancelledSessionsJson: string | null
  rejectionRemark: string | null
  createdAt: string
  instructor: { firstName: string; lastName: string; email: string }
  _count: { enrollments: number }
}

const S = {
  card: { backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  label: { color: '#5a7a96', fontSize: '0.8rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' },
  value: { fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#0B1A2E' },
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0B1A2E', marginBottom: '0.25rem' },
  sub: { color: '#5a7a96', fontSize: '0.9rem', marginBottom: '2rem' },
  btn: (color: string, bg: string): React.CSSProperties => ({
    backgroundColor: bg, color, border: 'none', padding: '0.375rem 0.875rem',
    borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
  }),
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectRemark, setRejectRemark] = useState('')
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null)
  const [meetLoading, setMeetLoading] = useState<string | null>(null)
  const [clearCancelLoading, setClearCancelLoading] = useState<string | null>(null)
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [instructorActionLoading, setInstructorActionLoading] = useState<string | null>(null)
  const [rejectingInstructorId, setRejectingInstructorId] = useState<string | null>(null)
  const [instructorRejectRemark, setInstructorRejectRemark] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/metrics').then((r) => r.json()),
      fetch('/api/admin/courses').then((r) => r.json()),
      fetch('/api/admin/instructors').then((r) => r.json()),
    ]).then(([m, c, i]) => {
      setMetrics(m)
      setCourses(Array.isArray(c) ? c : [])
      setInstructors(Array.isArray(i) ? i : [])
      setLoading(false)
    })
  }, [])

  const handleInstructorAction = async (instructorId: string, action: 'approve' | 'reject', remark?: string) => {
    setInstructorActionLoading(instructorId + action)
    await fetch('/api/admin/instructors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructorId, action, remark }),
    })
    const updated = await fetch('/api/admin/instructors').then((r) => r.json())
    setInstructors(Array.isArray(updated) ? updated : [])
    setInstructorActionLoading(null)
    setRejectingInstructorId(null)
    setInstructorRejectRemark('')
  }

  const handleAction = async (courseId: string, action: 'approve' | 'reject', remark?: string) => {
    setActionLoading(courseId + action)
    await fetch(`/api/courses/${courseId}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remark }),
    })
    const updated = await fetch('/api/admin/courses').then((r) => r.json())
    setCourses(updated)
    const m = await fetch('/api/admin/metrics').then((r) => r.json())
    setMetrics(m)
    setActionLoading(null)
    setRejectingId(null)
    setRejectRemark('')
  }

  const handleClearCancellations = async (courseId: string) => {
    setClearCancelLoading(courseId)
    await fetch(`/api/admin/courses/${courseId}/clear-cancellations`, { method: 'POST' })
    setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, cancelledSessionsJson: '[]' } : c))
    setClearCancelLoading(null)
  }

  const handleGenerateMeet = async (courseId: string) => {
    setMeetLoading(courseId)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/generate-meet`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        alert(`Failed to generate Meet link: ${data.error || 'Unknown error'}`)
        setMeetLoading(null)
        return
      }
      const updated = await fetch('/api/admin/courses').then((r) => r.json())
      setCourses(Array.isArray(updated) ? updated : [])
    } catch (err) {
      alert(`Failed to generate Meet link: ${err instanceof Error ? err.message : 'Network error'}`)
    }
    setMeetLoading(null)
  }

  const pending = courses.filter((c) => c.status === 'PENDING')

  return (
    <DashboardLayout role="admin">
      <h1 style={S.h1}>Admin Dashboard</h1>
      <p style={S.sub}>Platform overview and course approval queue</p>

      {/* Metrics */}
      {loading ? (
        <p style={{ color: '#5a7a96' }}>Loading...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Students', value: metrics?.totalStudents },
              { label: 'Instructors', value: metrics?.totalInstructors },
              { label: 'Courses', value: metrics?.totalCourses },
              { label: 'Enrollments', value: metrics?.totalEnrollments },
              { label: 'Total Revenue', value: `$${Number(metrics?.totalRevenue || 0).toFixed(2)}` },
              { label: 'Platform Revenue', value: `$${Number(metrics?.platformRevenue || 0).toFixed(2)}` },
            ].map((m) => (
              <div key={m.label} style={S.card}>
                <p style={S.label}>{m.label}</p>
                <p style={S.value}>{m.value ?? '—'}</p>
              </div>
            ))}
          </div>

          {/* Instructor Review Queue */}
          {(() => {
            const pendingInstructors = instructors.filter(i => i.instructorStatus === 'PENDING_REVIEW')
            return (
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#0B1A2E', marginBottom: '1rem' }}>
                  Instructor Applications{' '}
                  {pendingInstructors.length > 0 && (
                    <span style={{ backgroundColor: '#F5C842', color: '#0B1A2E', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      {pendingInstructors.length}
                    </span>
                  )}
                </h2>
                {pendingInstructors.length === 0 ? (
                  <div style={{ ...S.card, textAlign: 'center', color: '#5a7a96', padding: '2rem' }}>
                    No pending instructor applications.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pendingInstructors.map((inst) => (
                      <div key={inst.id} style={{ ...S.card }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: '#0B1A2E', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                              {inst.firstName} {inst.lastName}
                            </p>
                            <p style={{ color: '#5a7a96', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{inst.email} · {inst.country}</p>
                            {inst.aboutMe && <p style={{ color: '#2d4a6b', fontSize: '0.85rem', marginBottom: '0.5rem' }}><strong>About:</strong> {inst.aboutMe}</p>}
                            {inst.qualifications && <p style={{ color: '#2d4a6b', fontSize: '0.85rem', marginBottom: '0.5rem' }}><strong>Qualifications:</strong> {inst.qualifications}</p>}
                            {inst.subjects.length > 0 && <p style={{ color: '#2d4a6b', fontSize: '0.85rem', marginBottom: '0.5rem' }}><strong>Subjects:</strong> {inst.subjects.join(', ')}</p>}
                            {inst.certificatesUrl && (
                              <a href={inst.certificatesUrl} target="_blank" rel="noreferrer"
                                style={{ color: '#00C2A8', fontSize: '0.85rem', fontWeight: 600 }}>
                                📎 View Certificates / Resume →
                              </a>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
                            {rejectingInstructorId === inst.id ? (
                              <>
                                <textarea
                                  placeholder="Reason for rejection..."
                                  value={instructorRejectRemark}
                                  onChange={(e) => setInstructorRejectRemark(e.target.value)}
                                  rows={3}
                                  style={{ padding: '0.5rem', borderRadius: '6px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.8rem', resize: 'vertical' }}
                                />
                                <button onClick={() => handleInstructorAction(inst.id, 'reject', instructorRejectRemark)}
                                  disabled={instructorActionLoading === inst.id + 'reject'}
                                  style={S.btn('#fff', '#7f1d1d')}>
                                  {instructorActionLoading === inst.id + 'reject' ? '...' : 'Confirm Reject'}
                                </button>
                                <button onClick={() => setRejectingInstructorId(null)} style={S.btn('#5a7a96', 'transparent')}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleInstructorAction(inst.id, 'approve')}
                                  disabled={instructorActionLoading === inst.id + 'approve'}
                                  style={S.btn('#0B1A2E', '#00C2A8')}>
                                  {instructorActionLoading === inst.id + 'approve' ? '...' : '✓ Approve'}
                                </button>
                                <button onClick={() => setRejectingInstructorId(inst.id)}
                                  style={S.btn('#f87171', 'transparent')}>
                                  ✗ Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Approval Queue */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#0B1A2E', marginBottom: '1rem' }}>
              Approval Queue{' '}
              {pending.length > 0 && (
                <span style={{ backgroundColor: '#F5C842', color: '#0B1A2E', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  {pending.length}
                </span>
              )}
            </h2>

            {pending.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', color: '#5a7a96', padding: '3rem' }}>
                No pending courses — you're all caught up!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pending.map((course) => (
                  <div key={course.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <p style={{ color: '#0B1A2E', fontWeight: 600, marginBottom: '0.25rem' }}>{course.title}</p>
                        <p style={{ color: '#5a7a96', fontSize: '0.8rem' }}>
                          {course.subject.replace('_', ' ')} · {course.durationWeeks} weeks · ${Number(course.feeUsd).toFixed(2)}
                        </p>
                        <p style={{ color: '#5a7a96', fontSize: '0.8rem' }}>
                          by {course.instructor.firstName} {course.instructor.lastName} ({course.instructor.email})
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setViewingCourseId(viewingCourseId === course.id ? null : course.id)}
                          style={{ ...S.btn('#0B1A2E', 'transparent'), border: '1px solid #C5D5E4' }}
                        >
                          {viewingCourseId === course.id ? 'Hide Details' : 'View Details'}
                        </button>
                        <button
                          onClick={() => handleAction(course.id, 'approve')}
                          disabled={actionLoading === course.id + 'approve'}
                          style={S.btn('#0B1A2E', '#00C2A8')}
                        >
                          {actionLoading === course.id + 'approve' ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => { setRejectingId(course.id); setRejectRemark('') }}
                          disabled={actionLoading === course.id + 'reject'}
                          style={S.btn('#FFFFFF', '#d97706')}
                        >
                          Request Modifications
                        </button>
                      </div>
                    </div>

                    {viewingCourseId === course.id && (
                      <div style={{ borderTop: '1px solid #C5D5E4', paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {course.imageUrl && (
                          <img src={course.imageUrl} alt="Course thumbnail" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', objectPosition: 'top', borderRadius: '8px' }} />
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem' }}>
                          {[
                            { label: 'Grade Level', value: course.gradeLevel || '—' },
                            { label: 'Course Type', value: course.courseType === 'LIVE' ? 'Live Class' : 'Self-Paced' },
                            { label: 'Start Date', value: course.startDate || '—' },
                            { label: 'Days', value: course.daysOfWeek?.join(', ') || '—' },
                            { label: 'Start Time (UTC)', value: course.startTimeUtc || '—' },
                            { label: 'Session Duration', value: course.sessionDurationMins ? `${course.sessionDurationMins} min` : '—' },
                            { label: 'Fee', value: `$${Number(course.feeUsd).toFixed(2)} (${course.feeType?.replace('_', ' ') || ''})` },
                            { label: 'Topics', value: course.topics?.join(', ') || '—' },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p style={{ color: '#5a7a96', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>{label}</p>
                              <p style={{ color: '#0B1A2E', fontSize: '0.8rem' }}>{value}</p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p style={{ color: '#5a7a96', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Description</p>
                          <p style={{ color: '#0B1A2E', fontSize: '0.825rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{course.description || '—'}</p>
                        </div>
                        {course.contentUrl && (
                          <div>
                            <p style={{ color: '#5a7a96', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Content / Classroom URL</p>
                            <a href={course.contentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00C2A8', fontSize: '0.8rem', wordBreak: 'break-all' }}>{course.contentUrl}</a>
                          </div>
                        )}
                      </div>
                    )}

                    {rejectingId === course.id && (
                      <div style={{ borderTop: '1px solid #C5D5E4', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>What changes are needed? (shown to instructor on their edit page)</p>
                        <textarea
                          value={rejectRemark}
                          onChange={(e) => setRejectRemark(e.target.value)}
                          rows={3}
                          placeholder="e.g. Please add a detailed course description and update the pricing..."
                          style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#EEF3F8', border: '1px solid #d97706', color: '#0B1A2E', fontSize: '0.8rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleAction(course.id, 'reject', rejectRemark)}
                            disabled={actionLoading === course.id + 'reject'}
                            style={{ ...S.btn('#FFFFFF', '#d97706'), opacity: actionLoading === course.id + 'reject' ? 0.5 : 1 }}
                          >
                            {actionLoading === course.id + 'reject' ? '...' : 'Send Request'}
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectRemark('') }}
                            style={{ ...S.btn('#5a7a96', 'transparent'), border: '1px solid #C5D5E4' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Courses Missing Meet Link */}
          {courses.filter((c) => c.status === 'APPROVED' && c.courseType === 'LIVE' && !c.zoomJoinUrl).length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#0B1A2E', marginBottom: '0.5rem' }}>
                Live Courses Missing Meet Link
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {courses.filter((c) => c.status === 'APPROVED' && c.courseType === 'LIVE' && !c.zoomJoinUrl).map((course) => (
                  <div key={course.id} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <p style={{ color: '#0B1A2E', fontWeight: 600, marginBottom: '0.25rem' }}>{course.title}</p>
                      <p style={{ color: '#5a7a96', fontSize: '0.8rem' }}>
                        by {course.instructor.firstName} {course.instructor.lastName} · {course._count.enrollments} enrolled
                      </p>
                    </div>
                    <button
                      onClick={() => handleGenerateMeet(course.id)}
                      disabled={meetLoading === course.id}
                      style={{ ...S.btn('#0B1A2E', '#00C2A8'), opacity: meetLoading === course.id ? 0.5 : 1 }}
                    >
                      {meetLoading === course.id ? 'Generating...' : 'Generate Meet Link'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses with Cancelled Sessions */}
          {courses.filter((c) => c.status === 'APPROVED' && c.courseType === 'LIVE' && (() => { try { return JSON.parse(c.cancelledSessionsJson || '[]').length > 0 } catch { return false } })()).length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#0B1A2E', marginBottom: '0.5rem' }}>
                Courses with Cancelled Sessions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {courses.filter((c) => c.status === 'APPROVED' && c.courseType === 'LIVE' && (() => { try { return JSON.parse(c.cancelledSessionsJson || '[]').length > 0 } catch { return false } })()).map((course) => (
                  <div key={course.id} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <p style={{ color: '#0B1A2E', fontWeight: 600, marginBottom: '0.25rem' }}>{course.title}</p>
                      <p style={{ color: '#5a7a96', fontSize: '0.8rem' }}>
                        by {course.instructor.firstName} {course.instructor.lastName} · {course._count.enrollments} enrolled
                      </p>
                    </div>
                    <button
                      onClick={() => handleClearCancellations(course.id)}
                      disabled={clearCancelLoading === course.id}
                      style={{ ...S.btn('#0B1A2E', '#F5C842'), opacity: clearCancelLoading === course.id ? 0.5 : 1 }}
                    >
                      {clearCancelLoading === course.id ? 'Clearing...' : 'Clear Cancellations'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
