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
  feeUsd: number
  durationWeeks: number
  createdAt: string
  instructor: { firstName: string; lastName: string; email: string }
  _count: { enrollments: number }
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
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/metrics').then((r) => r.json()),
      fetch('/api/admin/courses').then((r) => r.json()),
    ]).then(([m, c]) => {
      setMetrics(m)
      setCourses(c)
      setLoading(false)
    })
  }, [])

  const handleAction = async (courseId: string, action: 'approve' | 'reject') => {
    setActionLoading(courseId + action)
    await fetch(`/api/courses/${courseId}/${action}`, { method: 'POST' })
    const updated = await fetch('/api/admin/courses').then((r) => r.json())
    setCourses(updated)
    const m = await fetch('/api/admin/metrics').then((r) => r.json())
    setMetrics(m)
    setActionLoading(null)
  }

  const pending = courses.filter((c) => c.status === 'PENDING')

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
                  <div key={course.id} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
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
                        onClick={() => handleAction(course.id, 'reject')}
                        disabled={actionLoading === course.id + 'reject'}
                        style={S.btn('#e8edf5', '#7f1d1d')}
                      >
                        {actionLoading === course.id + 'reject' ? '...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
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
                    {['Title', 'Instructor', 'Subject', 'Fee', 'Enrollments', 'Status'].map((h) => (
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
                      <td style={{ padding: '0.875rem 1rem', color: '#a8c4e0', fontSize: '0.875rem' }}>${Number(c.feeUsd).toFixed(2)}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#a8c4e0', fontSize: '0.875rem' }}>{c._count.enrollments}</td>
                      <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={c.status} /></td>
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
