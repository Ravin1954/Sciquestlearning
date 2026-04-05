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
  rejectionRemark?: string | null
  _count: { enrollments: number }
}

interface Earnings {
  grossRevenue: number
  netPayout: number
  platformFee: number
  stripeConnected: boolean
}

interface BankInfo {
  payoutMethod: 'bank' | 'paypal'
  paypalEmail?: string
  accountHolderName?: string
  bankName?: string
  routingNumber?: string
  accountNumber?: string
  accountType?: string
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
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [bankEditing, setBankEditing] = useState(false)
  const [bankSaving, setBankSaving] = useState(false)
  const [bankError, setBankError] = useState('')
  const [bankForm, setBankForm] = useState<BankInfo>({ payoutMethod: 'bank', paypalEmail: '', accountHolderName: '', bankName: '', routingNumber: '', accountNumber: '', accountType: 'Checking' })

  useEffect(() => {
    Promise.all([
      fetch('/api/instructor/courses').then((r) => r.json()),
      fetch('/api/instructor/earnings').then((r) => r.json()),
      fetch('/api/instructor/bank-details').then((r) => r.json()),
    ]).then(([c, e, b]) => {
      setCourses(c)
      setEarnings(e)
      if (b.bankInfo) {
        setBankInfo(b.bankInfo)
        setBankForm(b.bankInfo)
      }
      setLoading(false)
    })
  }, [])

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault()
    setBankSaving(true)
    setBankError('')
    try {
      const res = await fetch('/api/instructor/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankForm),
      })
      const data = await res.json()
      if (res.ok) {
        setBankInfo(bankForm)
        setBankEditing(false)
      } else {
        setBankError(data.error || 'Failed to save bank details')
      }
    } catch {
      setBankError('Something went wrong. Please try again.')
    }
    setBankSaving(false)
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
          {/* Bank Details */}
          {bankInfo && !bankEditing ? (
            <div style={{ backgroundColor: '#003d35', border: '1px solid #00C2A8', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#00C2A8', fontWeight: 600, marginBottom: '0.25rem' }}>Payout Details Saved</p>
                <p style={{ color: '#6b88a8', fontSize: '0.875rem' }}>
                  {bankInfo.payoutMethod === 'paypal'
                    ? `PayPal · ${bankInfo.paypalEmail}`
                    : `${bankInfo.bankName} · ${bankInfo.accountType} · ****${bankInfo.accountNumber?.slice(-4)}`}
                </p>
              </div>
              <button
                onClick={() => setBankEditing(true)}
                style={{ backgroundColor: 'transparent', color: '#00C2A8', border: '1px solid #00C2A8', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Edit
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#1a1200', border: '1px solid #b45309', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ color: '#fbbf24', fontWeight: 600, marginBottom: '0.25rem' }}>
                {bankInfo ? 'Edit Payout Details' : 'Add Your Payout Details'}
              </p>
              <p style={{ color: '#6b88a8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Choose how you'd like to receive your 80% payout after each course.
              </p>
              <form onSubmit={handleSaveBank} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Payout method toggle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  {(['bank', 'paypal'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setBankForm((f) => ({ ...f, payoutMethod: method }))}
                      style={{ padding: '0.75rem', borderRadius: '8px', border: bankForm.payoutMethod === method ? '2px solid #fbbf24' : '2px solid #1e3a5f', backgroundColor: bankForm.payoutMethod === method ? '#2a1f00' : '#060f1a', color: bankForm.payoutMethod === method ? '#fbbf24' : '#6b88a8', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      {method === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                    </button>
                  ))}
                </div>

                {bankForm.payoutMethod === 'paypal' ? (
                  <div>
                    <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>PayPal Email</p>
                    <input required value={bankForm.paypalEmail || ''} onChange={(e) => setBankForm((f) => ({ ...f, paypalEmail: e.target.value }))} type="email" placeholder="your@paypal.com" style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Account Holder Name</p>
                      <input required value={bankForm.accountHolderName || ''} onChange={(e) => setBankForm((f) => ({ ...f, accountHolderName: e.target.value }))} placeholder="Full legal name" style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Bank Name</p>
                      <input required value={bankForm.bankName || ''} onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))} placeholder="e.g. Bank of America" style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Routing Number</p>
                      <input required value={bankForm.routingNumber || ''} onChange={(e) => setBankForm((f) => ({ ...f, routingNumber: e.target.value }))} placeholder="9-digit routing number" maxLength={9} style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Account Number</p>
                      <input required value={bankForm.accountNumber || ''} onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value }))} placeholder="Account number" style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Account Type</p>
                      <select required value={bankForm.accountType || 'Checking'} onChange={(e) => setBankForm((f) => ({ ...f, accountType: e.target.value }))} style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.875rem', boxSizing: 'border-box' }}>
                        <option value="Checking">Checking</option>
                        <option value="Savings">Savings</option>
                      </select>
                    </div>
                  </div>
                )}

                {bankError && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{bankError}</p>}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" disabled={bankSaving} style={{ backgroundColor: '#fbbf24', color: '#0B1A2E', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                    {bankSaving ? 'Saving...' : 'Save Payout Details'}
                  </button>
                  {bankInfo && (
                    <button type="button" onClick={() => { setBankEditing(false); setBankForm(bankInfo) }} style={{ backgroundColor: 'transparent', color: '#6b88a8', border: '1px solid #1e3a5f', padding: '0.625rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
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
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {c.courseType === 'SELF_PACED' ? (
                        c.contentUrl ? (
                          <a href={c.contentUrl} target="_blank" rel="noopener noreferrer"
                            style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                            Course Materials →
                          </a>
                        ) : (
                          <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>No content URL</span>
                        )
                      ) : (
                        c.zoomStartUrl ? (
                          <a href={c.zoomStartUrl} target="_blank" rel="noopener noreferrer"
                            style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                            Start Class →
                          </a>
                        ) : (
                          <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>Meeting link pending</span>
                        )
                      )}
                    </div>
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
                  <div key={c.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.25rem' }}>{c.title}</p>
                        <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>
                          {c.subject.replace('_', ' ')} · {c.durationWeeks} weeks · ${Number(c.feeUsd).toFixed(2)} · {c._count.enrollments} enrolled
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
