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

function formatLocalTime(utcTime: string): string {
  if (!utcTime) return ''
  const [h, m] = utcTime.split(':').map(Number)
  const d = new Date()
  d.setUTCHours(h, m, 0, 0)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' })
}

const DAY_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
}

// Returns minutes until next scheduled session (negative if in the past today)
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
  let nextDay = ''
  for (const day of daysOfWeek) {
    const target = DAY_INDEX[day] ?? -1
    if (target < 0) continue
    let dayDiff = target - todayDay
    if (dayDiff <= 0) dayDiff += 7
    if (dayDiff < minDiff) { minDiff = dayDiff; nextDay = day }
  }
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + minDiff)
  d.setUTCHours(h, m, 0, 0)
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' at ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

const S = {
  card: { backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  label: { color: '#5a7a96', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' },
  value: { fontFamily: 'Fraunces, serif', fontSize: '1.875rem', fontWeight: 700, color: '#0B1A2E' },
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0B1A2E', marginBottom: '0.25rem' },
  sub: { color: '#5a7a96', fontSize: '0.9rem', marginBottom: '2rem' },
  h2: { fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#0B1A2E', marginBottom: '1rem' },
}

export default function InstructorPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [earnings, setEarnings] = useState<Earnings | null>(null)
  const [loading, setLoading] = useState(true)
  const [instructorStatus, setInstructorStatus] = useState<string>('APPROVED')
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
      fetch('/api/instructor/profile').then((r) => r.json()),
    ]).then(([c, e, b, p]) => {
      setCourses(c)
      setEarnings(e)
      if (b.bankInfo) {
        setBankInfo(b.bankInfo)
        setBankForm(b.bankInfo)
      }
      setInstructorStatus(p.instructorStatus || 'PENDING_REVIEW')
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

  const approved = courses.filter((c) => c.status === 'APPROVED')

  return (
    <DashboardLayout role="instructor">
      {instructorStatus === 'PENDING_REVIEW' && (
        <div style={{ backgroundColor: '#3d2a00', border: '1px solid #F5C842', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.25rem' }}>⏳</span>
          <div>
            <p style={{ color: '#F5C842', fontWeight: 700, marginBottom: '0.25rem' }}>Account Pending Approval</p>
            <p style={{ color: '#2d4a6b', fontSize: '0.875rem' }}>Your instructor application is under review. You will receive an email once the admin approves your account. You can then start creating courses.</p>
          </div>
        </div>
      )}
      {instructorStatus === 'REJECTED' && (
        <div style={{ backgroundColor: '#3d0f0f', border: '1px solid #f87171', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.25rem' }}>❌</span>
          <div>
            <p style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.25rem' }}>Application Not Approved</p>
            <p style={{ color: '#2d4a6b', fontSize: '0.875rem' }}>Your instructor application was not approved. Please contact us via the <a href="/contact" style={{ color: '#00C2A8' }}>Contact Us</a> page for more information.</p>
          </div>
        </div>
      )}
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

      {loading ? <p style={{ color: '#5a7a96' }}>Loading...</p> : (
        <>
          {/* Bank Details */}
          {bankInfo && !bankEditing ? (
            <div style={{ backgroundColor: '#003d35', border: '1px solid #00C2A8', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#00C2A8', fontWeight: 600, marginBottom: '0.25rem' }}>Payout Details Saved</p>
                <p style={{ color: '#5a7a96', fontSize: '0.875rem' }}>
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
              <p style={{ color: '#92400e', fontWeight: 600, marginBottom: '0.25rem' }}>
                {bankInfo ? 'Edit Payout Details' : 'Add Your Payout Details'}
              </p>
              <p style={{ color: '#5a7a96', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
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
                      style={{ padding: '0.75rem', borderRadius: '8px', border: bankForm.payoutMethod === method ? '2px solid #b8860b' : '2px solid #C5D5E4', backgroundColor: bankForm.payoutMethod === method ? '#FEF9C3' : '#FFFFFF', color: bankForm.payoutMethod === method ? '#92400e' : '#5a7a96', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      {method === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                    </button>
                  ))}
                </div>

                {bankForm.payoutMethod === 'paypal' ? (
                  <div>
                    <p style={{ color: '#2d4a6b', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>PayPal Email</p>
                    <input required value={bankForm.paypalEmail || ''} onChange={(e) => setBankForm((f) => ({ ...f, paypalEmail: e.target.value }))} type="email" placeholder="your@paypal.com" style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <p style={{ color: '#2d4a6b', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Account Holder Name</p>
                      <input required value={bankForm.accountHolderName || ''} onChange={(e) => setBankForm((f) => ({ ...f, accountHolderName: e.target.value }))} placeholder="Full legal name" style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <p style={{ color: '#2d4a6b', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Bank Name</p>
                      <input required value={bankForm.bankName || ''} onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))} placeholder="e.g. Bank of America" style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <p style={{ color: '#2d4a6b', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Routing Number</p>
                      <input required value={bankForm.routingNumber || ''} onChange={(e) => setBankForm((f) => ({ ...f, routingNumber: e.target.value }))} placeholder="9-digit routing number" maxLength={9} style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <p style={{ color: '#2d4a6b', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Account Number</p>
                      <input required value={bankForm.accountNumber || ''} onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value }))} placeholder="Account number" style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <p style={{ color: '#2d4a6b', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Account Type</p>
                      <select required value={bankForm.accountType || 'Checking'} onChange={(e) => setBankForm((f) => ({ ...f, accountType: e.target.value }))} style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem', boxSizing: 'border-box' }}>
                        <option value="Checking">Checking</option>
                        <option value="Savings">Savings</option>
                      </select>
                    </div>
                  </div>
                )}

                {bankError && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{bankError}</p>}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" disabled={bankSaving} style={{ backgroundColor: '#F5C842', color: '#0B1A2E', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                    {bankSaving ? 'Saving...' : 'Save Payout Details'}
                  </button>
                  {bankInfo && (
                    <button type="button" onClick={() => { setBankEditing(false); setBankForm(bankInfo) }} style={{ backgroundColor: 'transparent', color: '#5a7a96', border: '1px solid #C5D5E4', padding: '0.625rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
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
              { label: 'Gross Revenue', value: `$${Number(earnings?.grossRevenue || 0).toFixed(2)}`, color: '#0B1A2E' },
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

          {/* Quick link to My Courses */}
          <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: '#0B1A2E', fontWeight: 600, marginBottom: '0.25rem' }}>
                {approved.length} active course{approved.length !== 1 ? 's' : ''}
              </p>
              <p style={{ color: '#5a7a96', fontSize: '0.875rem' }}>
                View your full schedule, manage content, and add recordings.
              </p>
            </div>
            <Link
              href="/instructor/courses"
              style={{ backgroundColor: 'transparent', color: '#00C2A8', border: '1px solid #00C2A8', padding: '0.625rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
            >
              View My Courses →
            </Link>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
