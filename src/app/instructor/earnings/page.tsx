'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface Enrollment {
  id: string
  enrolledAt: string
  amountPaidUsd: number
  instructorPayoutUsd: number
  platformFeeUsd: number
  course: { title: string }
  student: { firstName: string; lastName: string }
}

interface EarningsData {
  enrollments: Enrollment[]
  grossRevenue: number
  netPayout: number
  platformFee: number
  stripeConnected: boolean
}

const S = {
  card: { backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  label: { color: '#6b88a8', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' },
  value: { fontFamily: 'Fraunces, serif', fontSize: '1.875rem', fontWeight: 700, color: '#e8edf5' },
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' },
  sub: { color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' },
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/instructor/earnings')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [])

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
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Gross Revenue', value: `$${Number(data.grossRevenue).toFixed(2)}`, color: '#e8edf5' },
              { label: 'Platform Fee (20%)', value: `$${Number(data.platformFee).toFixed(2)}`, color: '#f87171' },
              { label: 'Net Payout (80%)', value: `$${Number(data.netPayout).toFixed(2)}`, color: '#00C2A8' },
              { label: 'Total Enrollments', value: data.enrollments.length, color: '#F5C842' },
            ].map((m) => (
              <div key={m.label} style={S.card}>
                <p style={S.label}>{m.label}</p>
                <p style={{ ...S.value, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Enrollment History */}
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#e8edf5', marginBottom: '1rem' }}>
              Enrollment History
            </h2>
            {data.enrollments.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', color: '#6b88a8', padding: '3rem' }}>
                No enrollments yet. Earnings will appear here once students enroll in your courses.
              </div>
            ) : (
              <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e3a5f', backgroundColor: '#0a1d35' }}>
                      {['Date', 'Student', 'Course', 'Amount Paid', 'Your Payout'].map((h) => (
                        <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: '#6b88a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.enrollments.map((e, i) => (
                      <tr
                        key={e.id}
                        style={{ borderBottom: i < data.enrollments.length - 1 ? '1px solid #1e3a5f' : 'none' }}
                      >
                        <td style={{ padding: '0.875rem 1.25rem', color: '#6b88a8', whiteSpace: 'nowrap' }}>
                          {new Date(e.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: '#e8edf5' }}>
                          {e.student.firstName} {e.student.lastName}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: '#a8c4e0' }}>
                          {e.course.title}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: '#e8edf5', fontWeight: 600 }}>
                          ${Number(e.amountPaidUsd).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: '#00C2A8', fontWeight: 700 }}>
                          ${Number(e.instructorPayoutUsd).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
