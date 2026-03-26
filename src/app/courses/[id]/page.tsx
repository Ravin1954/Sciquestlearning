'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import NavBar from '@/components/NavBar'

interface Course {
  id: string
  title: string
  description: string
  subject: string
  durationWeeks: number
  daysOfWeek: string[]
  startTimeUtc: string
  sessionDurationMins: number
  feeUsd: number
  status: string
  instructor: { firstName: string; lastName: string; qualifications?: string }
}

const subjectColors: Record<string, string> = {
  BIOLOGY: '#22c55e',
  PHYSICAL_SCIENCE: '#3b82f6',
  CHEMISTRY: '#a855f7',
  MATHEMATICS: '#f59e0b',
}

const subjectLabels: Record<string, string> = {
  BIOLOGY: 'Biology',
  PHYSICAL_SCIENCE: 'Physical Science',
  CHEMISTRY: 'Chemistry',
  MATHEMATICS: 'Mathematics',
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => { setCourse(data); setLoading(false) })
  }, [id])

  const handleEnroll = async () => {
    if (!isSignedIn) { router.push('/sign-in'); return }
    setEnrolling(true)
    setError('')
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: id }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error || 'Failed to start checkout')
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
        <NavBar />
        <div style={{ textAlign: 'center', padding: '6rem', color: '#6b88a8' }}>Loading...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
        <NavBar />
        <div style={{ textAlign: 'center', padding: '6rem', color: '#6b88a8' }}>Course not found.</div>
      </div>
    )
  }

  const color = subjectColors[course.subject] || '#00C2A8'
  const instructorPayout = (Number(course.feeUsd) * 0.8).toFixed(2)

  return (
    <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
          {/* Main Content */}
          <div>
            <span style={{ backgroundColor: color + '22', color, padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {subjectLabels[course.subject] || course.subject}
            </span>

            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#e8edf5', margin: '1rem 0 0.5rem' }}>
              {course.title}
            </h1>

            <p style={{ color: '#6b88a8', marginBottom: '2rem' }}>
              Taught by <span style={{ color: '#a8c4e0' }}>{course.instructor.firstName} {course.instructor.lastName}</span>
            </p>

            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1.125rem', marginBottom: '0.875rem' }}>About This Course</h2>
              <p style={{ color: '#a8c4e0', lineHeight: 1.7 }}>{course.description}</p>
            </div>

            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1.125rem', marginBottom: '0.875rem' }}>Schedule</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Days', value: course.daysOfWeek.join(', ') },
                  { label: 'Time', value: `${course.startTimeUtc} UTC` },
                  { label: 'Session Length', value: `${course.sessionDurationMins} minutes` },
                  { label: 'Duration', value: `${course.durationWeeks} weeks` },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b88a8', fontSize: '0.875rem' }}>{item.label}</span>
                    <span style={{ color: '#e8edf5', fontSize: '0.875rem', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {course.instructor.qualifications && (
              <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1.125rem', marginBottom: '0.875rem' }}>About the Instructor</h2>
                <p style={{ color: '#a8c4e0', lineHeight: 1.7, fontSize: '0.9rem' }}>{course.instructor.qualifications}</p>
              </div>
            )}
          </div>

          {/* Enrollment Card */}
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 700, color: '#F5C842', marginBottom: '0.25rem' }}>
                ${Number(course.feeUsd).toFixed(2)}
              </p>
              <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                One-time course fee · Instructor receives ${instructorPayout}
              </p>

              {error && (
                <p style={{ color: '#f87171', backgroundColor: '#3d0f0f', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleEnroll}
                disabled={enrolling}
                style={{
                  width: '100%',
                  backgroundColor: enrolling ? '#005040' : '#00C2A8',
                  color: '#0B1A2E',
                  border: 'none',
                  padding: '0.875rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: enrolling ? 'not-allowed' : 'pointer',
                  marginBottom: '1rem',
                }}
              >
                {enrolling ? 'Redirecting to Checkout...' : isSignedIn ? 'Enroll Now →' : 'Sign In to Enroll →'}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Live Zoom sessions', 'Email reminders 20 min before class', 'Direct access to your instructor', 'Zoom join link sent on enrollment'].map((benefit) => (
                  <div key={benefit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#00C2A8', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
