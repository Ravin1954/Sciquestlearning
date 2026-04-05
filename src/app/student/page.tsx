'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

interface Feedback {
  attended: boolean
  rating: number
  comment?: string
}

interface Enrollment {
  id: string
  zoomJoinUrl: string
  enrolledAt: string
  feedback: Feedback | null
  course: {
    id: string
    title: string
    subject: string
    courseType: string
    durationWeeks: number
    daysOfWeek: string[]
    startTimeUtc: string
    sessionDurationMins: number
    contentUrl?: string
    status: string
    instructor: { firstName: string; lastName: string }
  }
}

const S = {
  card: { backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  h1: { fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' },
  sub: { color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' },
  h2: { fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: '#e8edf5', marginBottom: '1rem' },
}

const subjectColors: Record<string, string> = {
  BIOLOGY: '#22c55e',
  PHYSICAL_SCIENCE: '#3b82f6',
  CHEMISTRY: '#a855f7',
  MATHEMATICS: '#f59e0b',
}

function FeedbackForm({ enrollmentId, onSubmitted }: { enrollmentId: string; onSubmitted: () => void }) {
  const [attended, setAttended] = useState<boolean | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (attended === null) { setError('Please confirm if you attended.'); return }
    if (attended && rating === 0) { setError('Please select a rating.'); return }
    setLoading(true)
    const res = await fetch('/api/student/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, attended, rating: attended ? rating : 0, comment }),
    })
    if (res.ok) {
      onSubmitted()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to submit')
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#0a1a30', borderRadius: '8px', border: '1px solid #1e3a5f' }}>
      <p style={{ color: '#F5C842', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Rate this class</p>

      <p style={{ color: '#a8c4e0', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Did the instructor show up and conduct the class?</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {[{ val: true, label: 'Yes, attended' }, { val: false, label: 'No, did not attend' }].map((opt) => (
          <button
            key={String(opt.val)}
            type="button"
            onClick={() => setAttended(opt.val)}
            style={{
              padding: '0.375rem 0.875rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none',
              backgroundColor: attended === opt.val ? (opt.val ? '#003d35' : '#3d0f0f') : '#0f2240',
              color: attended === opt.val ? (opt.val ? '#00C2A8' : '#f87171') : '#6b88a8',
              outline: attended === opt.val ? `1px solid ${opt.val ? '#00C2A8' : '#f87171'}` : 'none',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {attended && (
        <>
          <p style={{ color: '#a8c4e0', fontSize: '0.8rem', marginBottom: '0.375rem' }}>Rate the class (1–5 stars)</p>
          <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: star <= rating ? '#F5C842' : '#1e3a5f' }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment about the class..."
            rows={2}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.8rem', resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }}
          />
        </>
      )}

      {error && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.5rem' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: '0.75rem', backgroundColor: '#00C2A8', color: '#0B1A2E', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  )
}

export default function StudentPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/student/enrollments')
      .then((r) => r.json())
      .then((data) => {
        setEnrollments(data)
        setLoading(false)
      })
  }, [])

  const handleFeedbackSubmitted = (enrollmentId: string) => {
    setFeedbackSubmitted((prev) => new Set([...prev, enrollmentId]))
  }

  return (
    <DashboardLayout role="student">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={S.h1}>My Dashboard</h1>
          <p style={S.sub}>Your enrolled courses and upcoming schedule</p>
        </div>
        <Link
          href="/courses"
          style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}
        >
          Browse Courses
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#6b88a8' }}>Loading...</p>
      ) : enrollments.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</p>
          <p style={{ color: '#e8edf5', fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>No courses yet</p>
          <p style={{ color: '#6b88a8', marginBottom: '1.5rem' }}>Browse our catalog to find live classes that match your interests.</p>
          <Link href="/courses" style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
            Browse Courses →
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Enrolled Courses', value: enrollments.length },
              { label: 'This Week', value: enrollments.filter((e) => e.course.daysOfWeek.length > 0).length },
            ].map((m) => (
              <div key={m.label} style={S.card}>
                <p style={{ color: '#6b88a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' }}>{m.label}</p>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#e8edf5' }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Enrolled Courses */}
          <h2 style={S.h2}>My Courses</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enrollments.map((enrollment) => {
              const course = enrollment.course
              const color = subjectColors[course.subject] || '#00C2A8'
              const hasFeedback = enrollment.feedback !== null || feedbackSubmitted.has(enrollment.id)
              const isLive = course.courseType === 'LIVE'

              return (
                <div key={enrollment.id} style={S.card}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ backgroundColor: color + '22', color, padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          {course.subject.replace('_', ' ')}
                        </span>
                        <span style={{ backgroundColor: isLive ? '#0a2240' : '#2d1a4a', color: isLive ? '#38bdf8' : '#c084fc', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isLive ? 'Live' : 'Self-Paced'}
                        </span>
                      </div>
                      <h3 style={{ color: '#e8edf5', fontWeight: 600, fontSize: '1.0625rem', marginBottom: '0.375rem' }}>{course.title}</h3>
                      <p style={{ color: '#6b88a8', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                        Instructor: {course.instructor.firstName} {course.instructor.lastName}
                      </p>
                      <p style={{ color: '#6b88a8', fontSize: '0.825rem' }}>
                        {course.courseType === 'SELF_PACED'
                          ? `Self-Paced · Study anytime · ${course.durationWeeks > 0 ? `${course.durationWeeks} weeks` : 'Lifetime access'}`
                          : `${course.daysOfWeek.join(', ')} · ${course.startTimeUtc} UTC · ${course.sessionDurationMins} min/session`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      {course.courseType === 'SELF_PACED' ? (
                        course.contentUrl ? (
                          <a href={course.contentUrl.startsWith('http') ? course.contentUrl : `https://${course.contentUrl}`} target="_blank" rel="noopener noreferrer"
                            style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '0.625rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                            Access Course →
                          </a>
                        ) : (
                          <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>Content pending</span>
                        )
                      ) : enrollment.zoomJoinUrl ? (
                        <a href={enrollment.zoomJoinUrl} target="_blank" rel="noopener noreferrer"
                          style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', padding: '0.625rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                          Join Class →
                        </a>
                      ) : (
                        <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>Link pending</span>
                      )}
                    </div>
                  </div>

                  {/* Feedback section — only for live courses */}
                  {isLive && (
                    hasFeedback ? (
                      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#0a1a30', borderRadius: '8px', border: '1px solid #1e3a5f' }}>
                        <p style={{ color: '#00C2A8', fontSize: '0.8rem', fontWeight: 600 }}>
                          {enrollment.feedback?.attended === false
                            ? 'You reported the instructor did not attend.'
                            : `Feedback submitted · ${'★'.repeat(enrollment.feedback?.rating || 0)}${'☆'.repeat(5 - (enrollment.feedback?.rating || 0))}`}
                        </p>
                      </div>
                    ) : (
                      <FeedbackForm
                        enrollmentId={enrollment.id}
                        onSubmitted={() => handleFeedbackSubmitted(enrollment.id)}
                      />
                    )
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
