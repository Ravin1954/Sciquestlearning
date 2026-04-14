'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import CourseCard from '@/components/CourseCard'

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

interface Course {
  id: string
  title: string
  description?: string
  subject: string
  courseType: string
  gradeLevel?: string
  durationWeeks: number
  daysOfWeek: string[]
  startTimeUtc: string
  scheduleJson?: string
  sessionDurationMins: number
  feeUsd: number | string
  feeType?: string
  instructor?: { firstName: string; lastName: string }
  _count: { enrollments: number }
}

interface Instructor {
  id: string
  firstName: string
  lastName: string
  country: string
  qualifications: string
  aboutMe: string
  subjects: string[]
  courses: Course[]
}

export default function InstructorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'LIVE' | 'SELF_PACED' | 'ALL'>('ALL')

  useEffect(() => {
    fetch(`/api/instructors/${id}`)
      .then((r) => r.json())
      .then((data) => { setInstructor(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
        <NavBar />
        <div style={{ textAlign: 'center', padding: '6rem', color: '#6b88a8' }}>Loading...</div>
      </div>
    )
  }

  if (!instructor || (instructor as { error?: string }).error) {
    return (
      <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
        <NavBar />
        <div style={{ textAlign: 'center', padding: '6rem', color: '#6b88a8' }}>Instructor not found.</div>
      </div>
    )
  }

  const liveCourses = instructor.courses.filter((c) => c.courseType === 'LIVE')
  const selfPacedCourses = instructor.courses.filter((c) => c.courseType === 'SELF_PACED')
  const displayCourses = activeTab === 'ALL' ? instructor.courses
    : activeTab === 'LIVE' ? liveCourses : selfPacedCourses

  // Inject instructor name into courses for CourseCard
  const coursesWithInstructor = displayCourses.map((c) => ({
    ...c,
    instructor: { firstName: instructor.firstName, lastName: instructor.lastName },
  }))

  return (
    <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Back link */}
        <Link
          href="/courses"
          style={{ color: '#6b88a8', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}
        >
          ← Back to Browse Courses
        </Link>

        {/* Profile header */}
        <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              backgroundColor: '#003d35', border: '3px solid #00C2A8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#00C2A8', fontWeight: 700 }}>
                {instructor.firstName?.[0]?.toUpperCase() || '?'}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5' }}>
                  {instructor.firstName} {instructor.lastName}
                </h1>
                <span style={{ backgroundColor: '#003d35', color: '#00C2A8', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                  ✓ Verified Instructor
                </span>
              </div>

              {instructor.country && (
                <p style={{ color: '#6b88a8', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  📍 {instructor.country}
                </p>
              )}

              {/* Subjects taught */}
              {instructor.subjects && instructor.subjects.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  {instructor.subjects.map((s) => (
                    <span
                      key={s}
                      style={{
                        backgroundColor: (subjectColors[s] || '#00C2A8') + '22',
                        color: subjectColors[s] || '#00C2A8',
                        padding: '0.2rem 0.7rem', borderRadius: '999px',
                        fontSize: '0.75rem', fontWeight: 600,
                      }}
                    >
                      {subjectLabels[s] || s}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontFamily: 'Fraunces, serif', color: '#F5C842', fontSize: '1.25rem', fontWeight: 700 }}>
                    {instructor.courses.length}
                  </span>
                  <span style={{ color: '#6b88a8', fontSize: '0.8rem', marginLeft: '0.35rem' }}>
                    course{instructor.courses.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {liveCourses.length > 0 && (
                  <div>
                    <span style={{ fontFamily: 'Fraunces, serif', color: '#38bdf8', fontSize: '1.25rem', fontWeight: 700 }}>
                      {liveCourses.length}
                    </span>
                    <span style={{ color: '#6b88a8', fontSize: '0.8rem', marginLeft: '0.35rem' }}>live</span>
                  </div>
                )}
                {selfPacedCourses.length > 0 && (
                  <div>
                    <span style={{ fontFamily: 'Fraunces, serif', color: '#c084fc', fontSize: '1.25rem', fontWeight: 700 }}>
                      {selfPacedCourses.length}
                    </span>
                    <span style={{ color: '#6b88a8', fontSize: '0.8rem', marginLeft: '0.35rem' }}>self-paced</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>

          {/* Left: About + Qualifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {instructor.aboutMe && (
              <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1rem', marginBottom: '0.75rem' }}>
                  About
                </h2>
                <p style={{ color: '#a8c4e0', fontSize: '0.875rem', lineHeight: 1.7 }}>
                  {instructor.aboutMe}
                </p>
              </div>
            )}

            {instructor.qualifications && (
              <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1rem', marginBottom: '0.75rem' }}>
                  Qualifications &amp; Experience
                </h2>
                <p style={{ color: '#a8c4e0', fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {instructor.qualifications}
                </p>
              </div>
            )}

            {!instructor.aboutMe && !instructor.qualifications && (
              <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
                <p style={{ color: '#3a5070', fontStyle: 'italic', fontSize: '0.875rem' }}>
                  This instructor has not yet added a bio.
                </p>
              </div>
            )}
          </div>

          {/* Right: Courses */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', color: '#e8edf5', fontSize: '1.25rem' }}>
                Courses by {instructor.firstName}
              </h2>

              {/* Tab filter */}
              {liveCourses.length > 0 && selfPacedCourses.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {(['ALL', 'LIVE', 'SELF_PACED'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      style={{
                        padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid',
                        borderColor: activeTab === t ? '#00C2A8' : '#1e3a5f',
                        backgroundColor: activeTab === t ? '#003d35' : 'transparent',
                        color: activeTab === t ? '#00C2A8' : '#6b88a8',
                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: activeTab === t ? 700 : 400,
                      }}
                    >
                      {t === 'ALL' ? 'All' : t === 'LIVE' ? 'Live' : 'Self-Paced'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {displayCourses.length === 0 ? (
              <p style={{ color: '#6b88a8', fontSize: '0.875rem' }}>No courses in this category.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {coursesWithInstructor.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
