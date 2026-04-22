'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

interface Student {
  enrollmentId: string
  studentName: string
  email: string
  amountPaidUsd: number
  enrolledAt: string
}

interface Course {
  id: string
  title: string
  subject: string
  courseType: string
  feeUsd: number
  durationWeeks: number
  _count: { enrollments: number }
}

const S = {
  card: { backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0B1A2E', marginBottom: '0.25rem' },
  sub: { color: '#5a7a96', fontSize: '0.9rem', marginBottom: '2rem' },
}

export default function CourseEnrollmentsPage() {
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [manageId, setManageId] = useState<string | null>(null)
  const [refundReason, setRefundReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundSubmitting, setRefundSubmitting] = useState(false)
  const [refundResult, setRefundResult] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/instructor/courses/${courseId}`).then((r) => r.json()),
      fetch(`/api/instructor/courses/${courseId}/roster`).then((r) => r.json()),
    ]).then(([courseData, rosterData]) => {
      setCourse(courseData.error ? null : courseData)
      setStudents(Array.isArray(rosterData) ? rosterData : [])
      setLoading(false)
    })
  }, [courseId])

  const handleRefundRequest = async (enrollmentId: string) => {
    if (!refundReason.trim() || !refundAmount) {
      setRefundResult('error:Please fill in both the reason and refund amount.')
      return
    }
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
      setManageId(null)
    } else {
      setRefundResult(`error:${data.error || 'Failed to send request.'}`)
    }
    setRefundSubmitting(false)
  }

  return (
    <DashboardLayout role="instructor">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/instructor/courses" style={{ color: '#5a7a96', fontSize: '0.875rem', textDecoration: 'none' }}>
          ← Back to My Courses
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#5a7a96' }}>Loading...</p>
      ) : !course ? (
        <p style={{ color: '#f87171' }}>Course not found.</p>
      ) : (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={S.h1}>{course.title}</h1>
            <p style={S.sub}>
              {course.subject.replace(/_/g, ' ')} · {course.courseType === 'LIVE' ? 'Live' : 'Self-Paced'} · {students.length} student{students.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>

          {students.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '3rem', color: '#5a7a96' }}>
              No students enrolled in this course yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {students.map((s) => (
                <div key={s.enrollmentId} style={S.card}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <p style={{ color: '#0B1A2E', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{s.studentName}</p>
                      <p style={{ color: '#5a7a96', fontSize: '0.825rem', marginBottom: '0.25rem' }}>{s.email}</p>
                      <p style={{ color: '#5a7a96', fontSize: '0.775rem' }}>
                        Enrolled:{' '}
                        {new Date(s.enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        &ensp;·&ensp;Amount Paid:{' '}
                        <span style={{ color: '#0B1A2E', fontWeight: 600 }}>${s.amountPaidUsd.toFixed(2)}</span>
                      </p>
                    </div>
                    {course.courseType === 'LIVE' && (
                      <button
                        onClick={() => {
                          setManageId(manageId === s.enrollmentId ? null : s.enrollmentId)
                          setRefundReason('')
                          setRefundAmount('')
                          setRefundResult(null)
                        }}
                        style={{
                          backgroundColor: manageId === s.enrollmentId ? '#f87171' : 'transparent',
                          color: manageId === s.enrollmentId ? '#fff' : '#f87171',
                          border: '1px solid #f87171',
                          padding: '0.5rem 1.125rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {manageId === s.enrollmentId ? 'Close' : 'Manage Enrollment'}
                      </button>
                    )}
                  </div>

                  {course.courseType === 'LIVE' && manageId === s.enrollmentId && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #C5D5E4' }}>
                      <p style={{ color: '#f87171', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Refund Request
                      </p>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '0.75rem',
                          backgroundColor: '#EEF3F8',
                          borderRadius: '8px',
                          padding: '0.875rem 1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div>
                          <p style={{ color: '#5a7a96', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>Student</p>
                          <p style={{ color: '#0B1A2E', fontWeight: 600, fontSize: '0.9rem' }}>{s.studentName}</p>
                        </div>
                        <div>
                          <p style={{ color: '#5a7a96', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>Total Amount Paid</p>
                          <p style={{ color: '#0B1A2E', fontWeight: 600, fontSize: '0.9rem' }}>${s.amountPaidUsd.toFixed(2)}</p>
                        </div>
                        <div>
                          <p style={{ color: '#5a7a96', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>Course</p>
                          <p style={{ color: '#0B1A2E', fontWeight: 600, fontSize: '0.9rem' }}>{course.title}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        <div>
                          <label style={{ color: '#2d4a6b', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
                            Reason for Refund
                          </label>
                          <textarea
                            placeholder="e.g. I was unable to teach on Apr 21 due to an emergency. Requesting refund for 1 missed session."
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '0.625rem 0.875rem',
                              borderRadius: '8px',
                              backgroundColor: '#EEF3F8',
                              border: '1px solid #C5D5E4',
                              color: '#0B1A2E',
                              fontSize: '0.875rem',
                              fontFamily: "'DM Sans', sans-serif",
                              resize: 'vertical',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ color: '#2d4a6b', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
                            Refund Amount (USD)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 12.50"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            min="0"
                            step="0.01"
                            style={{
                              width: '220px',
                              padding: '0.625rem 0.875rem',
                              borderRadius: '8px',
                              backgroundColor: '#EEF3F8',
                              border: '1px solid #C5D5E4',
                              color: '#0B1A2E',
                              fontSize: '0.875rem',
                            }}
                          />
                        </div>

                        {refundResult && (
                          <p
                            style={{
                              fontSize: '0.82rem',
                              padding: '0.5rem 0.875rem',
                              borderRadius: '8px',
                              backgroundColor: refundResult.startsWith('success') ? '#003d35' : '#3d0f0f',
                              color: refundResult.startsWith('success') ? '#00C2A8' : '#f87171',
                            }}
                          >
                            {refundResult.replace(/^(success|error):/, '')}
                          </p>
                        )}

                        <div>
                          <button
                            onClick={() => handleRefundRequest(s.enrollmentId)}
                            disabled={refundSubmitting}
                            style={{
                              backgroundColor: '#f87171',
                              color: '#fff',
                              border: 'none',
                              padding: '0.625rem 1.5rem',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              cursor: refundSubmitting ? 'not-allowed' : 'pointer',
                              opacity: refundSubmitting ? 0.6 : 1,
                            }}
                          >
                            {refundSubmitting ? 'Sending...' : 'Submit Refund Request to Admin'}
                          </button>
                          <p style={{ color: '#5a7a96', fontSize: '0.75rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                            SciQuest admin will process the refund to the student directly.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
