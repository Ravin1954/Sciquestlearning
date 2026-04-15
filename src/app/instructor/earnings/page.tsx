'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface Enrollment {
  id: string
  enrolledAt: string
  amountPaidUsd: number
  instructorPayoutUsd: number
  platformFeeUsd: number
  instructorPaidOut?: boolean
  course: { id: string; title: string }
  student: { firstName: string; lastName: string }
}

interface CourseGroup {
  courseId: string
  courseTitle: string
  enrollments: Enrollment[]
  grossRevenue: number
  payout: number
  platformFee: number
  paidOut: number
  pending: number
}

interface EarningsData {
  enrollments: Enrollment[]
  grossRevenue: number
  netPayout: number
  platformFee: number
}

const S = {
  card: { backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  label: { color: '#6b88a8', fontSize: '0.72rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' },
  value: { fontFamily: 'Fraunces, serif', fontSize: '1.875rem', fontWeight: 700, color: '#e8edf5' },
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' } as React.CSSProperties,
  sub: { color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' } as React.CSSProperties,
  th: { padding: '0.75rem 1.25rem', textAlign: 'left' as const, color: '#6b88a8', fontSize: '0.72rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 600 },
  td: { padding: '0.75rem 1.25rem', fontSize: '0.875rem', borderTop: '1px solid #1e3a5f' },
}

function groupByCourse(enrollments: Enrollment[]): CourseGroup[] {
  const map = new Map<string, CourseGroup>()
  for (const e of enrollments) {
    const cid = e.course.id
    if (!map.has(cid)) {
      map.set(cid, { courseId: cid, courseTitle: e.course.title, enrollments: [], grossRevenue: 0, payout: 0, platformFee: 0, paidOut: 0, pending: 0 })
    }
    const g = map.get(cid)!
    g.enrollments.push(e)
    g.grossRevenue += Number(e.amountPaidUsd)
    g.payout += Number(e.instructorPayoutUsd)
    g.platformFee += Number(e.platformFeeUsd)
    if (e.instructorPaidOut) g.paidOut += Number(e.instructorPayoutUsd)
    else g.pending += Number(e.instructorPayoutUsd)
  }
  return Array.from(map.values()).sort((a, b) => b.grossRevenue - a.grossRevenue)
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'by-course' | 'all'>('overview')
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/instructor/earnings')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [])

  const courseGroups = data ? groupByCourse(data.enrollments) : []

  return (
    <DashboardLayout role="instructor">
      <h1 style={S.h1}>Earnings</h1>
      <p style={S.sub}>Your revenue and payout history</p>

      {loading ? (
        <p style={{ color: '#6b88a8' }}>Loading...</p>
      ) : !data ? (
        <p style={{ color: '#f87171' }}>Failed to load earnings.</p>
      ) : (
        <>
          {/* Summary Cards — always visible */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Gross Revenue', value: `$${Number(data.grossRevenue).toFixed(2)}`, color: '#e8edf5' },
              { label: 'Platform Fee (20%)', value: `$${Number(data.platformFee).toFixed(2)}`, color: '#f87171' },
              { label: 'Your Earnings (80%)', value: `$${Number(data.netPayout).toFixed(2)}`, color: '#00C2A8' },
              { label: 'Total Enrollments', value: data.enrollments.length, color: '#F5C842' },
              { label: 'Courses with Students', value: courseGroups.length, color: '#a855f7' },
            ].map((m) => (
              <div key={m.label} style={S.card}>
                <p style={S.label}>{m.label}</p>
                <p style={{ ...S.value, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1e3a5f', marginBottom: '1.5rem' }}>
            {[
              { value: 'overview', label: 'By Course' },
              { value: 'all', label: 'All Enrollments' },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value as typeof tab)}
                style={{
                  padding: '0.75rem 1.5rem', border: 'none', background: 'transparent', cursor: 'pointer',
                  color: tab === t.value ? '#00C2A8' : '#6b88a8',
                  borderBottom: tab === t.value ? '2px solid #00C2A8' : '2px solid transparent',
                  fontWeight: tab === t.value ? 700 : 500, fontSize: '0.875rem',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* BY COURSE TAB */}
          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {courseGroups.length === 0 ? (
                <div style={{ ...S.card, textAlign: 'center', color: '#6b88a8', padding: '3rem' }}>
                  No enrollments yet. Earnings will appear here once students enroll in your courses.
                </div>
              ) : courseGroups.map((g) => (
                <div key={g.courseId} style={S.card}>
                  {/* Course header row */}
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setExpandedCourse(expandedCourse === g.courseId ? null : g.courseId)}
                  >
                    <div>
                      <p style={{ color: '#e8edf5', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{g.courseTitle}</p>
                      <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>
                        {g.enrollments.length} student{g.enrollments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#6b88a8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Gross</p>
                        <p style={{ color: '#e8edf5', fontWeight: 600 }}>${g.grossRevenue.toFixed(2)}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#6b88a8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Your Payout</p>
                        <p style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 700, color: '#00C2A8' }}>${g.payout.toFixed(2)}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#6b88a8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Pending</p>
                        <p style={{ color: g.pending > 0 ? '#F5C842' : '#22c55e', fontWeight: 600 }}>${g.pending.toFixed(2)}</p>
                      </div>
                      <span style={{ color: '#6b88a8', fontSize: '1rem' }}>
                        {expandedCourse === g.courseId ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded student breakdown */}
                  {expandedCourse === g.courseId && (
                    <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e3a5f' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ backgroundColor: '#0a1d35' }}>
                          <tr>
                            {['Date', 'Student', 'Amount Paid', 'Your Payout', 'Status'].map((h) => (
                              <th key={h} style={S.th}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {g.enrollments.map((e) => (
                            <tr key={e.id}>
                              <td style={{ ...S.td, color: '#6b88a8', whiteSpace: 'nowrap' }}>
                                {new Date(e.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td style={{ ...S.td, color: '#e8edf5' }}>{e.student.firstName} {e.student.lastName}</td>
                              <td style={{ ...S.td, color: '#e8edf5', fontWeight: 600 }}>${Number(e.amountPaidUsd).toFixed(2)}</td>
                              <td style={{ ...S.td, color: '#00C2A8', fontWeight: 700 }}>${Number(e.instructorPayoutUsd).toFixed(2)}</td>
                              <td style={S.td}>
                                {e.instructorPaidOut
                                  ? <span style={{ color: '#22c55e', fontSize: '0.78rem', fontWeight: 600 }}>✓ Paid</span>
                                  : <span style={{ color: '#F5C842', fontSize: '0.78rem', fontWeight: 600 }}>Pending</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {/* Course subtotals */}
                        <tfoot style={{ backgroundColor: '#0a1d35', borderTop: '2px solid #1e3a5f' }}>
                          <tr>
                            <td colSpan={2} style={{ ...S.td, color: '#6b88a8', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>Course Total</td>
                            <td style={{ ...S.td, color: '#e8edf5', fontWeight: 700 }}>${g.grossRevenue.toFixed(2)}</td>
                            <td style={{ ...S.td, color: '#00C2A8', fontWeight: 700 }}>${g.payout.toFixed(2)}</td>
                            <td style={{ ...S.td, color: '#6b88a8', fontSize: '0.78rem' }}>
                              {g.paidOut > 0 && <span style={{ color: '#22c55e' }}>${g.paidOut.toFixed(2)} paid · </span>}
                              {g.pending > 0 && <span style={{ color: '#F5C842' }}>${g.pending.toFixed(2)} pending</span>}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ALL ENROLLMENTS TAB */}
          {tab === 'all' && (
            <div>
              {data.enrollments.length === 0 ? (
                <div style={{ ...S.card, textAlign: 'center', color: '#6b88a8', padding: '3rem' }}>
                  No enrollments yet.
                </div>
              ) : (
                <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0a1d35' }}>
                        {['Date', 'Student', 'Course', 'Amount Paid', 'Your Payout', 'Status'].map((h) => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.enrollments.map((e, i) => (
                        <tr key={e.id} style={{ borderTop: i > 0 ? '1px solid #1e3a5f' : 'none' }}>
                          <td style={{ ...S.td, color: '#6b88a8', whiteSpace: 'nowrap' }}>
                            {new Date(e.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ ...S.td, color: '#e8edf5' }}>{e.student.firstName} {e.student.lastName}</td>
                          <td style={{ ...S.td, color: '#a8c4e0' }}>{e.course.title}</td>
                          <td style={{ ...S.td, color: '#e8edf5', fontWeight: 600 }}>${Number(e.amountPaidUsd).toFixed(2)}</td>
                          <td style={{ ...S.td, color: '#00C2A8', fontWeight: 700 }}>${Number(e.instructorPayoutUsd).toFixed(2)}</td>
                          <td style={S.td}>
                            {e.instructorPaidOut
                              ? <span style={{ color: '#22c55e', fontSize: '0.78rem', fontWeight: 600 }}>✓ Paid</span>
                              : <span style={{ color: '#F5C842', fontSize: '0.78rem', fontWeight: 600 }}>Pending</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
