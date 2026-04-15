'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface Enrollment {
  id: string
  enrolledAt: string
  instructorPaidOutAt?: string
  amountPaidUsd: number
  instructorPayoutUsd: number
  course: {
    title: string
    instructor: { id: string; firstName: string; lastName: string; email: string }
  }
  student: { firstName: string; lastName: string }
}

interface GroupedInstructor {
  id: string
  name: string
  email: string
  enrollments: Enrollment[]
  totalOwed: number
}

const S = {
  card: { backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' } as React.CSSProperties,
  sub: { color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' } as React.CSSProperties,
  th: { padding: '0.75rem 1rem', textAlign: 'left' as const, color: '#6b88a8', fontSize: '0.72rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 600 },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', borderTop: '1px solid #1e3a5f' },
}

function groupByInstructor(enrollments: Enrollment[]): GroupedInstructor[] {
  const map = new Map<string, GroupedInstructor>()
  for (const e of enrollments) {
    const inst = e.course.instructor
    if (!map.has(inst.id)) {
      map.set(inst.id, { id: inst.id, name: `${inst.firstName} ${inst.lastName}`, email: inst.email, enrollments: [], totalOwed: 0 })
    }
    const g = map.get(inst.id)!
    g.enrollments.push(e)
    g.totalOwed += Number(e.instructorPayoutUsd)
  }
  return Array.from(map.values()).sort((a, b) => b.totalOwed - a.totalOwed)
}

export default function PayoutsPage() {
  const [pending, setPending] = useState<Enrollment[]>([])
  const [paid, setPaid] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [marking, setMarking] = useState(false)
  const [tab, setTab] = useState<'pending' | 'history'>('pending')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/payouts')
      .then((r) => r.json())
      .then((d) => { setPending(d.pending || []); setPaid(d.paid || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAllForInstructor = (enrollments: Enrollment[]) => {
    setSelected((prev) => {
      const next = new Set(prev)
      enrollments.forEach((e) => next.add(e.id))
      return next
    })
  }

  const markAsPaid = async () => {
    if (selected.size === 0) return
    setMarking(true)
    await fetch('/api/admin/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentIds: Array.from(selected) }),
    })
    setSelected(new Set())
    setMarking(false)
    load()
  }

  const grouped = groupByInstructor(pending)
  const totalPendingAmount = pending.reduce((sum, e) => sum + Number(e.instructorPayoutUsd), 0)

  return (
    <DashboardLayout role="admin">
      <h1 style={S.h1}>Instructor Payouts</h1>
      <p style={S.sub}>Enrollments where 1 week has passed — mark as paid after transferring to instructor</p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Pending Payouts', value: pending.length, color: '#f59e0b' },
          { label: 'Total Amount Owed', value: `$${totalPendingAmount.toFixed(2)}`, color: '#f87171' },
          { label: 'Instructors Owed', value: grouped.length, color: '#a855f7' },
          { label: 'Paid Out (All Time)', value: paid.length, color: '#00C2A8' },
        ].map((m) => (
          <div key={m.label} style={S.card}>
            <p style={{ color: '#6b88a8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' }}>{m.label}</p>
            <p style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1e3a5f', marginBottom: '1.5rem' }}>
        {[{ value: 'pending', label: 'Pending Payouts' }, { value: 'history', label: 'Payout History' }].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value as 'pending' | 'history')}
            style={{
              padding: '0.75rem 1.5rem', border: 'none', background: 'transparent', cursor: 'pointer',
              color: tab === t.value ? '#00C2A8' : '#6b88a8',
              borderBottom: tab === t.value ? '2px solid #00C2A8' : '2px solid transparent',
              fontWeight: tab === t.value ? 700 : 500, fontSize: '0.875rem',
            }}
          >
            {t.label}{t.value === 'pending' && pending.length > 0 ? ` (${pending.length})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#6b88a8' }}>Loading...</p>
      ) : tab === 'pending' ? (
        <>
          {/* Mark as Paid action bar */}
          {selected.size > 0 && (
            <div style={{ backgroundColor: '#003d35', border: '1px solid #00C2A8', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ color: '#00C2A8', fontWeight: 600, fontSize: '0.9rem' }}>
                {selected.size} enrollment{selected.size !== 1 ? 's' : ''} selected — $
                {pending.filter((e) => selected.has(e.id)).reduce((s, e) => s + Number(e.instructorPayoutUsd), 0).toFixed(2)} total
              </span>
              <button
                onClick={markAsPaid}
                disabled={marking}
                style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                {marking ? 'Saving...' : '✓ Mark as Paid'}
              </button>
            </div>
          )}

          {grouped.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', color: '#6b88a8', padding: '3rem' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>✓</p>
              <p style={{ fontWeight: 600, color: '#e8edf5', marginBottom: '0.25rem' }}>All instructors paid up to date</p>
              <p style={{ fontSize: '0.85rem' }}>No pending payouts older than 1 week.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {grouped.map((inst) => (
                <div key={inst.id} style={S.card}>
                  {/* Instructor header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ color: '#e8edf5', fontWeight: 700, fontSize: '1rem' }}>{inst.name}</p>
                      <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>{inst.email}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', fontWeight: 700, color: '#F5C842' }}>
                        ${inst.totalOwed.toFixed(2)}
                      </span>
                      <button
                        onClick={() => selectAllForInstructor(inst.enrollments)}
                        style={{ backgroundColor: '#0a1d35', border: '1px solid #1e3a5f', color: '#a8c4e0', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Select All
                      </button>
                    </div>
                  </div>

                  {/* Enrollments table */}
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e3a5f' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead style={{ backgroundColor: '#0a1d35' }}>
                        <tr>
                          <th style={{ ...S.th, width: '40px' }}></th>
                          <th style={S.th}>Student</th>
                          <th style={S.th}>Course</th>
                          <th style={S.th}>Enrolled</th>
                          <th style={S.th}>Amount Paid</th>
                          <th style={S.th}>Payout (80%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inst.enrollments.map((e) => (
                          <tr key={e.id} style={{ backgroundColor: selected.has(e.id) ? '#003020' : 'transparent' }}>
                            <td style={S.td}>
                              <input
                                type="checkbox"
                                checked={selected.has(e.id)}
                                onChange={() => toggleSelect(e.id)}
                                style={{ accentColor: '#00C2A8', width: '15px', height: '15px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ ...S.td, color: '#e8edf5' }}>{e.student.firstName} {e.student.lastName}</td>
                            <td style={{ ...S.td, color: '#a8c4e0' }}>{e.course.title}</td>
                            <td style={{ ...S.td, color: '#6b88a8', whiteSpace: 'nowrap' }}>
                              {new Date(e.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td style={{ ...S.td, color: '#e8edf5', fontWeight: 600 }}>${Number(e.amountPaidUsd).toFixed(2)}</td>
                            <td style={{ ...S.td, color: '#00C2A8', fontWeight: 700 }}>${Number(e.instructorPayoutUsd).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Payout History */
        <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          {paid.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b88a8', padding: '3rem' }}>No payouts recorded yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: '#0a1d35' }}>
                <tr>
                  {['Paid Out On', 'Instructor', 'Student', 'Course', 'Amount Paid', 'Payout (80%)'].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paid.map((e) => (
                  <tr key={e.id}>
                    <td style={{ ...S.td, color: '#6b88a8', whiteSpace: 'nowrap' }}>
                      {e.instructorPaidOutAt
                        ? new Date(e.instructorPaidOutAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ ...S.td, color: '#e8edf5', fontWeight: 600 }}>
                      {e.course.instructor.firstName} {e.course.instructor.lastName}
                    </td>
                    <td style={{ ...S.td, color: '#a8c4e0' }}>{e.student.firstName} {e.student.lastName}</td>
                    <td style={{ ...S.td, color: '#6b88a8' }}>{e.course.title}</td>
                    <td style={{ ...S.td, color: '#e8edf5' }}>${Number(e.amountPaidUsd).toFixed(2)}</td>
                    <td style={{ ...S.td, color: '#00C2A8', fontWeight: 700 }}>${Number(e.instructorPayoutUsd).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
