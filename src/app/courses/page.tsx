'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import NavBar from '@/components/NavBar'
import CourseCard from '@/components/CourseCard'

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
  sessionDurationMins: number
  feeUsd: number | string
  instructor: { firstName: string; lastName: string }
}

const SUBJECTS = [
  { value: '', label: 'All Subjects' },
  { value: 'BIOLOGY', label: 'Biology' },
  { value: 'PHYSICAL_SCIENCE', label: 'Physical Science' },
  { value: 'CHEMISTRY', label: 'Chemistry' },
  { value: 'MATHEMATICS', label: 'Mathematics' },
]

const filterStyle: React.CSSProperties = {
  padding: '0.625rem 1rem',
  borderRadius: '8px',
  backgroundColor: '#0f2240',
  border: '1px solid #1e3a5f',
  color: '#e8edf5',
  fontSize: '0.875rem',
  cursor: 'pointer',
}

const GRADE_OPTIONS = [
  { value: '', label: 'All Grades' },
  { value: 'Middle School', label: 'Middle School' },
  { value: 'High School', label: 'High School' },
]

function CoursesContent() {
  const searchParams = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'LIVE' | 'SELF_PACED'>(
    searchParams.get('type') === 'SELF_PACED' ? 'SELF_PACED' : 'LIVE'
  )
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (subject) params.set('subject', subject)
    if (gradeLevel) params.set('gradeLevel', gradeLevel)
    params.set('courseType', activeTab)
    setLoading(true)
    fetch(`/api/courses?${params}`)
      .then((r) => r.json())
      .then((data) => { setCourses(data); setLoading(false) })
  }, [subject, gradeLevel, activeTab])

  const filtered = courses.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.lastName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.5rem' }}>
          Browse Courses
        </h1>
        <p style={{ color: '#6b88a8' }}>Discover science and mathematics courses for middle &amp; high school students</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderBottom: '1px solid #1e3a5f' }}>
        {[
          { value: 'LIVE', label: 'Live Classes', desc: 'Scheduled sessions with an instructor' },
          { value: 'SELF_PACED', label: 'Self-Paced', desc: 'Study at your own time' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as 'LIVE' | 'SELF_PACED')}
            style={{
              padding: '0.875rem 2rem',
              border: 'none',
              borderBottom: activeTab === tab.value ? '3px solid #00C2A8' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.value ? '#00C2A8' : '#6b88a8',
              cursor: 'pointer',
              fontWeight: activeTab === tab.value ? 700 : 500,
              fontSize: '0.9rem',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses or instructors..."
          style={{ ...filterStyle, flex: '1', minWidth: '220px' }}
        />
        <select value={subject} onChange={(e) => setSubject(e.target.value)} style={filterStyle}>
          {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} style={filterStyle}>
          {GRADE_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b88a8' }}>Loading courses...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#0f2240', borderRadius: '12px', border: '1px solid #1e3a5f' }}>
          <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔭</p>
          <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.5rem' }}>No courses found</p>
          <p style={{ color: '#6b88a8' }}>
            {activeTab === 'LIVE' ? 'No live classes available yet.' : 'No self-paced courses available yet.'} Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: '#6b88a8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''} available
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function CoursesPage() {
  return (
    <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
      <NavBar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: '#6b88a8' }}>Loading...</div>}>
        <CoursesContent />
      </Suspense>
    </div>
  )
}
