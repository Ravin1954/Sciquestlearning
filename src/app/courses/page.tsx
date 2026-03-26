'use client'

import { useEffect, useState } from 'react'
import NavBar from '@/components/NavBar'
import CourseCard from '@/components/CourseCard'

interface Course {
  id: string
  title: string
  subject: string
  durationWeeks: number
  daysOfWeek: string[]
  startTimeUtc: string
  sessionDurationMins: number
  feeUsd: number
  instructor: { firstName: string; lastName: string }
}

const SUBJECTS = [
  { value: '', label: 'All Subjects' },
  { value: 'BIOLOGY', label: 'Biology' },
  { value: 'PHYSICAL_SCIENCE', label: 'Physical Science' },
  { value: 'CHEMISTRY', label: 'Chemistry' },
  { value: 'MATHEMATICS', label: 'Mathematics' },
]

const DURATIONS = [
  { value: '', label: 'Any Duration' },
  { value: '4', label: '4 Weeks' },
  { value: '8', label: '8 Weeks' },
  { value: '12', label: '12 Weeks' },
  { value: '16', label: '16 Weeks' },
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [duration, setDuration] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (subject) params.set('subject', subject)
    if (duration) params.set('duration', duration)
    setLoading(true)
    fetch(`/api/courses?${params}`)
      .then((r) => r.json())
      .then((data) => { setCourses(data); setLoading(false) })
  }, [subject, duration])

  const filtered = courses.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.lastName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
      <NavBar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.5rem' }}>
            Browse Courses
          </h1>
          <p style={{ color: '#6b88a8' }}>Discover live, instructor-led classes in science and mathematics</p>
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
          <select value={duration} onChange={(e) => setDuration(e.target.value)} style={filterStyle}>
            {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6b88a8' }}>Loading courses...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#0f2240', borderRadius: '12px', border: '1px solid #1e3a5f' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔭</p>
            <p style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.5rem' }}>No courses found</p>
            <p style={{ color: '#6b88a8' }}>Try adjusting your filters</p>
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
    </div>
  )
}
