'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import StatusBadge from '@/components/StatusBadge'

interface Course {
  id: string
  title: string
  subject: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  feeUsd: number
  durationWeeks: number
  daysOfWeek: string[]
  startTimeUtc: string
  sessionDurationMins: number
  zoomJoinUrl?: string
  rejectionRemark?: string | null
  _count: { enrollments: number }
}

interface Earnings {
  grossRevenue: number
  netPayout: number
  platformFee: number
}

const S = {
  card: { backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  label: { color: '#6b88a8', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' },
  value: { fontFamily: 'Fraunces, serif', fontSize: '1.875rem', fontWeight: 700, color: '#e8edf5' },
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' },
  sub: { color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' },
  h2: { fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#e8edf5', marginBottom: '1rem' },
}

export default function InstructorPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [earnings, setEarnings] = useState<Earnings | null>(null)
  const [hasStripe, setHasStripe] = useState(false)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/instructor/courses').then((r) => r.json()),
      fetch('/api/instructor/earnings').then((r) => r.json()),
    ]).then(([c, e]) => {
      setCourses(c)
      setEarnings(e)
      setHasStripe(Number(e.grossRevenue) > 0)
      setLoading(false)
    })
  }, [])

  const handleStripeConnect = async () => {
    setStripeLoading(true)
    const res = await fetch('/api/stripe/connect', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    setStripeLoading(false)
  }

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
          <h1 style={S.h1}>Instructor Dashboard</h1>
          <p style={S.sub}>Manage your courses and track your earnings</p>
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
          {/* Stripe Connect Banner */}
          {!hasStripe && (
            <div style={{ backgroundColor: '#1a2d00', border: '1px solid #4a7c00', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#a3e635', fontWeight: 600, marginBottom: '0.25rem' }}>Connect Stripe to Receive Payments</p>
                <p style={{ color: '#6b88a8', fontSize: '0.875rem' }}>Set up Stripe Connect to receive your 80% share of course fees automatically.</p>
              </div>
              <button
                onClick={handleStripeConnect}
                disabled={stripeLoading}
                style={{ backgroundColor: '#a3e635', color: '#0B1A2E', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
              >
                {stripeLoading ? 'Redirecting...' : 'Connect Stripe →'}
              </button>
            </div>
          )}

          {/* Earnings Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Gross Revenue', value: `$${Number(earnings?.grossRevenue || 0).toFixed(2)}`, color: '#e8edf5' },
              { label: 'Platform Fee (20%)', value: `$${Number(earnings?.platformFee || 0).toFixed(2)}`, color: '#f87171' },
              { label: 'Net Payout (80%)', value: `$${Number(earnings?.netPayout || 0).toFixed(2)}`, color: '#00C2A8' },
              { label: 'Active Courses', value: approved.length, color: '#F5C842' },
            ].map((m) => (
              <div key={m.label} style={S.card}>
                <p style={S.label}>{m.label}</p>
                <p style={{ ...S.value, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Upcoming Classes */}
          {approved.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={S.h2}>Upcoming Classes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {approved.map((c) => (
                  <div key={c.id} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.25rem' }}>{c.title}</p>
                      <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>
                        {c.daysOfWeek.join(', ')} · {c.startTimeUtc} UTC · {c.sessionDurationMins} min · {c._count.enrollments} students
                      </p>
                    </div>
                    {c.zoomJoinUrl ? (
                      <a
                        href={c.zoomJoinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                      >
                        Start Class →
                      </a>
                    ) : (
                      <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>No meeting link</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Courses */}
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
                  <div key={c.id} style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.25rem' }}>{c.title}</p>
                      <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>
                        {c.subject.replace('_', ' ')} · {c.durationWeeks} weeks · ${Number(c.feeUsd).toFixed(2)} · {c._count.enrollments} enrolled
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <StatusBadge status={c.status} />
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
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
