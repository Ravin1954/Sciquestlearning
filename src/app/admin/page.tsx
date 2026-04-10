'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatusBadge from '@/components/StatusBadge'

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
  subject: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  courseType: 'LIVE' | 'SELF_PACED'
  feeUsd: number
  durationWeeks: number
  zoomJoinUrl: string | null
  createdAt: string
  instructor: { firstName: string; lastName: string; email: string }
  _count: { enrollments: number }
}

interface Feedback {
  id: string
  attended: boolean
  rating: number
  comment?: string
  createdAt: string
  enrollment: {
    student: { firstName: string; lastName: string; email: string }
    course: {
      title: string
      subject: string
      instructor: { firstName: string; lastName: string }
    }
  }
}

interface Enrollment {
  id: string
  enrolledAt: string
  amountPaidUsd: number
  instructorPayoutUsd: number
  instructorPaidOut: boolean
  instructorPaidOutAt: string | null
  student: { firstName: string; lastName: string; email: string }
  course: {
    title: string
    subject: string
    instructor: { firstName: string; lastName: string; bankInfo: string | null }
  }
}

const S = {
  card: { backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  label: { color: '#6b88a8', fontSize: '0.8rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' },
  value: { fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#e8edf5' },
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' },
  sub: { color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' },
  btn: (color: string, bg: string): React.CSSProperties => ({
    backgroundColor: bg, color, border: 'none', padding: '0.375rem 0.875rem',
    borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
  }),
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectRemark, setRejectRemark] = useState('')
  const [payoutLoading, setPayoutLoading] = useState<string | null>(null)
  const [payoutMsg, setPayoutMsg] = useState<{ id: string; success: boolean; text: string } | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [meetLoading, setMeetLoading] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/metrics').then((r) => r.json()),
      fetch('/api/admin/courses').then((r) => r.json()),
      fetch('/api/admin/enrollments').then((r) => r.json()),
      fetch('/api/admin/feedback').then((r) => r.json()),
    ]).then(([m, c, e, f]) => {
      setMetrics(m)
      setCourses(Array.isArray(c) ? c : [])
      setEnrollments(Array.isArray(e) ? e : [])
      setFeedbacks(Array.isArray(f) ? f : [])
      setLoading(false)
    })
  }, [])

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

  const handlePayout = async (enrollmentId: string) => {
    setPayoutLoading(enrollmentId)
    setPayoutMsg(null)
    try {
      const res = await fetch('/api/admin/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId }),
      })
      const data = await res.json()
      if (res.ok) {
        setPayoutMsg({ id: enrollmentId, success: true, text: `Paid out $${Number(data.payoutUsd).toFixed(2)} ✓` })
        const updated = await fetch('/api/admin/enrollments').then((r) => r.json())
        setEnrollments(Array.isArray(updated) ? updated : [])
      } else {
        setPayoutMsg({ id: enrollmentId, success: false, text: data.error || 'Payout failed' })
      }
    } catch {
      setPayoutMsg({ id: enrollmentId, success: false, text: 'Network error' })
    }
    setPayoutLoading(null)
  }

  const handleGenerateMeet = async (courseId: string) => {
    setMeetLoading(courseId)
    const res = await fetch(`/api/admin/courses/${courseId}/generate-meet`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      alert(`Failed to generate Meet link: ${data.error || 'Unknown error'}`)
      setMeetLoading(null)
      return
    }
    const updated = await fetch('/api/admin/courses').then((r) => r.json())
    setCourses(Array.isArray(updated) ? updated : [])
    setMeetLoading(null)
  }

  const handleForceDelete = async (courseId: string) => {
    setDeleteLoading(courseId)
    await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' })
    const [updated, m] = await Promise.all([
      fetch('/api/admin/courses').then((r) => r.json()),
      fetch('/api/admin/metrics').then((r) => r.json()),
    ])
    setCourses(Array.isArray(updated) ? updated : [])
    setMetrics(m)
    setDeleteLoading(null)
    setConfirmDeleteId(null)
  }

  const pending = courses.filter((c) => c.status === 'PENDING')
  const pendingPayouts = enrollments.filter((e) => !e.instructorPaidOut)
  const completedPayouts = enrollments.filter((e) => e.instructorPaidOut)

  return (
    <DashboardLayout role="admin">
      <h1 style={S.h1}>Admin Dashboard</h1>
      <p style={S.sub}>Platform overview and course approval queue</p>

      {/* Metrics */}
      {loading ? (
        <p style={{ color: '#6b88a8' }}>Loading...</p>
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

          {/* Approval Queue */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#e8edf5', marginBottom: '1rem' }}>
              Approval Queue{' '}
              {pending.length > 0 && (
                <span style={{ backgroundColor: '#F5C842', color: '#0B1A2E', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  {pending.length}
                </span>
              )}
            </h2>

            {pending.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', color: '#6b88a8', padding: '3rem' }}>
                No pending courses — you're all caught up!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pending.map((course) => (
                  <div key={course.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.25rem' }}>{course.title}</p>
                        <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>
                          {course.subject.replace('_', ' ')} · {course.durationWeeks} weeks · ${Number(course.feeUsd).toFixed(2)}
                        </p>
                        <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>
                          by {course.instructor.firstName} {course.instructor.lastName} ({course.instructor.email})
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                          style={S.btn('#e8edf5', '#7f1d1d')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    {rejectingId === course.id && (
                      <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>Add remarks for the instructor:</p>
                        <textarea
                          value={rejectRemark}
                          onChange={(e) => setRejectRemark(e.target.value)}
                          rows={3}
                          placeholder="Explain what needs to be changed before resubmitting..."
                          style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#060f1a', border: '1px solid #7f1d1d', color: '#e8edf5', fontSize: '0.8rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleAction(course.id, 'reject', rejectRemark)}
                            disabled={actionLoading === course.id + 'reject'}
                            style={{ ...S.btn('#e8edf5', '#7f1d1d'), opacity: actionLoading === course.id + 'reject' ? 0.5 : 1 }}
                          >
                            {actionLoading === course.id + 'reject' ? '...' : 'Confirm Reject'}
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectRemark('') }}
                            style={{ ...S.btn('#a8c4e0', 'transparent'), border: '1px solid #1e3a5f' }}
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
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#e8edf5', marginBottom: '0.5rem' }}>
                Missing Meet Links
                <span style={{ backgroundColor: '#f87171', color: '#fff', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', fontWeight: 700, marginLeft: '0.75rem' }}>
                  action needed
                </span>
              </h2>
              <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '1rem' }}>
                These approved live courses don&apos;t have a Google Meet link yet.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {courses.filter((c) => c.status === 'APPROVED' && c.courseType === 'LIVE' && !c.zoomJoinUrl).map((course) => (
                  <div key={course.id} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.25rem' }}>{course.title}</p>
                      <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>
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

          {/* Instructor Payouts */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#e8edf5', marginBottom: '0.5rem' }}>
              Instructor Payouts
              {pendingPayouts.length > 0 && (
                <span style={{ backgroundColor: '#F5C842', color: '#0B1A2E', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', fontWeight: 700, marginLeft: '0.75rem' }}>
                  {pendingPayouts.length} pending
                </span>
              )}
            </h2>
            <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Full payment is held on the platform. Pay out 80% to the instructor after the course has started.
            </p>

            {pendingPayouts.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', color: '#6b88a8', padding: '2rem' }}>
                No pending payouts.
              </div>
            ) : (
              <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                      {['Student', 'Course', 'Instructor', 'Paid', 'Payout (80%)', 'Bank Details', 'Action'].map((h) => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6b88a8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayouts.map((e, i) => (
                      <tr key={e.id} style={{ borderBottom: i < pendingPayouts.length - 1 ? '1px solid #1e3a5f' : 'none' }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#e8edf5', fontSize: '0.8rem' }}>{e.student.firstName} {e.student.lastName}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#a8c4e0', fontSize: '0.8rem' }}>{e.course.title}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#a8c4e0', fontSize: '0.8rem' }}>{e.course.instructor.firstName} {e.course.instructor.lastName}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#F5C842', fontSize: '0.8rem', fontWeight: 600 }}>${Number(e.amountPaidUsd).toFixed(2)}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#00C2A8', fontSize: '0.8rem', fontWeight: 600 }}>${Number(e.instructorPayoutUsd).toFixed(2)}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>
                          {e.course.instructor.bankInfo ? (() => {
                            const b = JSON.parse(e.course.instructor.bankInfo)
                            return b.payoutMethod === 'paypal'
                              ? <span style={{ color: '#e8edf5' }}>PayPal: {b.paypalEmail}</span>
                              : <span style={{ color: '#e8edf5' }}>{b.bankName} ****{b.accountNumber.slice(-4)}</span>
                          })() : <span style={{ color: '#f87171' }}>Not added</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {payoutMsg?.id === e.id ? (
                            <span style={{ fontSize: '0.8rem', color: payoutMsg.success ? '#00C2A8' : '#f87171' }}>{payoutMsg.text}</span>
                          ) : (
                            <button
                              onClick={() => handlePayout(e.id)}
                              disabled={payoutLoading === e.id || !e.course.instructor.bankInfo}
                              style={{
                                ...S.btn('#0B1A2E', '#00C2A8'),
                                opacity: (!e.course.instructor.bankInfo || payoutLoading === e.id) ? 0.4 : 1,
                                cursor: !e.course.instructor.bankInfo ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {payoutLoading === e.id ? '...' : 'Mark Paid'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {completedPayouts.length > 0 && (
              <details>
                <summary style={{ color: '#6b88a8', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                  {completedPayouts.length} completed payout{completedPayouts.length > 1 ? 's' : ''}
                </summary>
                <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                        {['Student', 'Course', 'Instructor', 'Amount Paid Out', 'Date'].map((h) => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6b88a8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {completedPayouts.map((e, i) => (
                        <tr key={e.id} style={{ borderBottom: i < completedPayouts.length - 1 ? '1px solid #1e3a5f' : 'none' }}>
                          <td style={{ padding: '0.75rem 1rem', color: '#e8edf5', fontSize: '0.8rem' }}>{e.student.firstName} {e.student.lastName}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#a8c4e0', fontSize: '0.8rem' }}>{e.course.title}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#a8c4e0', fontSize: '0.8rem' }}>{e.course.instructor.firstName} {e.course.instructor.lastName}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#00C2A8', fontSize: '0.8rem', fontWeight: 600 }}>${Number(e.instructorPayoutUsd).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#6b88a8', fontSize: '0.8rem' }}>{e.instructorPaidOutAt ? new Date(e.instructorPaidOutAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </div>

          {/* Student Feedback & Attendance */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#e8edf5', marginBottom: '0.5rem' }}>
              Student Feedback & Attendance
              {feedbacks.filter((f) => !f.attended).length > 0 && (
                <span style={{ backgroundColor: '#f87171', color: '#fff', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', fontWeight: 700, marginLeft: '0.75rem' }}>
                  {feedbacks.filter((f) => !f.attended).length} no-show report{feedbacks.filter((f) => !f.attended).length > 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Students confirm attendance and rate each class. Review before releasing instructor payouts.
            </p>
            {feedbacks.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', color: '#6b88a8', padding: '2rem' }}>
                No feedback submitted yet.
              </div>
            ) : (
              <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                      {['Student', 'Course', 'Instructor', 'Attended', 'Rating', 'Comment', 'Date'].map((h) => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6b88a8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((f, i) => (
                      <tr key={f.id} style={{ borderBottom: i < feedbacks.length - 1 ? '1px solid #1e3a5f' : 'none', backgroundColor: !f.attended ? '#1a0a0a' : 'transparent' }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#e8edf5', fontSize: '0.8rem' }}>{f.enrollment.student.firstName} {f.enrollment.student.lastName}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#a8c4e0', fontSize: '0.8rem' }}>{f.enrollment.course.title}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#a8c4e0', fontSize: '0.8rem' }}>{f.enrollment.course.instructor.firstName} {f.enrollment.course.instructor.lastName}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                          {f.attended
                            ? <span style={{ color: '#00C2A8', fontWeight: 600 }}>Yes</span>
                            : <span style={{ color: '#f87171', fontWeight: 600 }}>No-show</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#F5C842', fontSize: '0.875rem' }}>
                          {f.attended ? '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating) : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#6b88a8', fontSize: '0.8rem', maxWidth: '200px' }}>{f.comment || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#6b88a8', fontSize: '0.8rem' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* All Courses Table */}
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#e8edf5', marginBottom: '1rem' }}>
              All Courses
            </h2>
            <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                    {['Title', 'Instructor', 'Subject', 'Type', 'Fee', 'Enrollments', 'Status', ''].map((h) => (
                      <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#6b88a8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < courses.length - 1 ? '1px solid #1e3a5f' : 'none' }}>
                      <td style={{ padding: '0.875rem 1rem', color: '#e8edf5', fontSize: '0.875rem', fontWeight: 500 }}>{c.title}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#a8c4e0', fontSize: '0.875rem' }}>{c.instructor.firstName} {c.instructor.lastName}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#a8c4e0', fontSize: '0.875rem' }}>{c.subject.replace('_', ' ')}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: c.courseType === 'SELF_PACED' ? '#00C2A8' : '#F5C842' }}>{c.courseType === 'SELF_PACED' ? 'Self-Paced' : 'Live'}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#a8c4e0', fontSize: '0.875rem' }}>${Number(c.feeUsd).toFixed(2)}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#a8c4e0', fontSize: '0.875rem' }}>{c._count.enrollments}</td>
                      <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={c.status} /></td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {confirmDeleteId === c.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ color: '#f87171', fontSize: '0.75rem' }}>Sure?</span>
                            <button onClick={() => handleForceDelete(c.id)} disabled={deleteLoading === c.id}
                              style={{ ...S.btn('#fff', '#7f1d1d'), opacity: deleteLoading === c.id ? 0.5 : 1 }}>
                              {deleteLoading === c.id ? '...' : 'Yes'}
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} style={S.btn('#a8c4e0', 'transparent')}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(c.id)} style={S.btn('#f87171', 'transparent')}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
