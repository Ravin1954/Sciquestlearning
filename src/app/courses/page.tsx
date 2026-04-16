'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
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
  scheduleJson?: string
  sessionDurationMins: number
  feeUsd: number | string
  feeType?: string
  instructor: { id: string; firstName: string; lastName: string }
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
  backgroundColor: '#FFFFFF',
  border: '1px solid #C5D5E4',
  color: '#0B1A2E',
  fontSize: '0.875rem',
  cursor: 'pointer',
}

const GRADE_OPTIONS = [
  { value: '', label: 'All Grades' },
  { value: 'Middle School', label: 'Middle School' },
  { value: 'High School', label: 'High School' },
]

const PAGE_SIZE = 9

function CoursesContent() {
  const searchParams = useSearchParams()
  const { isSignedIn } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'LIVE' | 'SELF_PACED'>(
    searchParams.get('type') === 'SELF_PACED' ? 'SELF_PACED' : 'LIVE'
  )
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [search, setSearch] = useState('')
  const [instructorFilter, setInstructorFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams()
    if (subject) params.set('subject', subject)
    if (gradeLevel) params.set('gradeLevel', gradeLevel)
    params.set('courseType', activeTab)
    setLoading(true)
    fetch(`/api/courses?${params}`)
      .then((r) => r.json())
      .then((data) => { setCourses(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setCourses([]); setLoading(false) })
  }, [subject, gradeLevel, activeTab])

  // Reset to page 1 whenever filters/search/tab change
  useEffect(() => { setPage(1) }, [subject, gradeLevel, activeTab, search, instructorFilter])

  // Reset instructor filter when tab changes
  useEffect(() => { setInstructorFilter('') }, [activeTab])

  // Unique instructors from loaded courses
  const instructors = Array.from(
    new Map(courses.map((c) => {
      const key = `${c.instructor.firstName} ${c.instructor.lastName}`
      return [key, { name: key, id: c.instructor.id }]
    })).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  const filtered = courses.filter((c) => {
    const fullName = `${c.instructor.firstName} ${c.instructor.lastName}`
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.lastName.toLowerCase().includes(search.toLowerCase())
    const matchInstructor = !instructorFilter || fullName === instructorFilter
    return matchSearch && matchInstructor
  })


  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 700, color: '#0B1A2E', marginBottom: '0.5rem' }}>
          Browse Courses
        </h1>
        <p style={{ color: '#5a7a96' }}>Discover science and mathematics courses for middle &amp; high school students</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderBottom: '1px solid #C5D5E4' }}>
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
              borderBottom: activeTab === tab.value ? '3px solid #00A896' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.value ? '#00A896' : '#5a7a96',
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

      {/* Instructor filter chips — only visible after login */}
      {isSignedIn && instructors.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{ color: '#5a7a96', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Instructor:</span>
          <button
            onClick={() => setInstructorFilter('')}
            style={{
              padding: '0.3rem 0.875rem', borderRadius: '999px', border: '1px solid',
              borderColor: !instructorFilter ? '#00A896' : '#C5D5E4',
              backgroundColor: !instructorFilter ? '#E0F7F4' : 'transparent',
              color: !instructorFilter ? '#00A896' : '#5a7a96',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: !instructorFilter ? 700 : 400,
            }}
          >
            All Instructors
          </button>
          {instructors.map((inst) => (
            <button
              key={inst.name}
              onClick={() => setInstructorFilter(instructorFilter === inst.name ? '' : inst.name)}
              style={{
                padding: '0.3rem 0.875rem', borderRadius: '999px', border: '1px solid',
                borderColor: instructorFilter === inst.name ? '#b8860b' : '#C5D5E4',
                backgroundColor: instructorFilter === inst.name ? '#FEF9C3' : 'transparent',
                color: instructorFilter === inst.name ? '#92400e' : '#2d4a6b',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: instructorFilter === inst.name ? 700 : 400,
              }}
            >
              {inst.name}
            </button>
          ))}
        </div>
      )}


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
        <div style={{ textAlign: 'center', padding: '4rem', color: '#5a7a96' }}>Loading courses...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #C5D5E4' }}>
          <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔭</p>
          <p style={{ color: '#0B1A2E', fontWeight: 600, marginBottom: '0.5rem' }}>No courses found</p>
          <p style={{ color: '#5a7a96' }}>
            {activeTab === 'LIVE' ? 'No live classes available yet.' : 'No self-paced courses available yet.'} Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: '#5a7a96', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
            {instructorFilter && <span style={{ color: '#b8860b', fontWeight: 600 }}> · {instructorFilter}</span>}
            {totalPages > 1 && <span style={{ marginLeft: '0.5rem' }}>· Page {page} of {totalPages}</span>}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {paginated.map((course) => (
              <CourseCard key={course.id} course={course} showInstructor={!!isSignedIn} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
              <button
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={page === 1}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #C5D5E4', backgroundColor: page === 1 ? '#EEF3F8' : '#FFFFFF', color: page === 1 ? '#C5D5E4' : '#2d4a6b', cursor: page === 1 ? 'default' : 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: p === page ? '1px solid #00A896' : '1px solid #C5D5E4', backgroundColor: p === page ? '#E0F7F4' : '#FFFFFF', color: p === page ? '#00A896' : '#5a7a96', cursor: 'pointer', fontWeight: p === page ? 700 : 400, fontSize: '0.875rem' }}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={page === totalPages}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #C5D5E4', backgroundColor: page === totalPages ? '#EEF3F8' : '#FFFFFF', color: page === totalPages ? '#C5D5E4' : '#2d4a6b', cursor: page === totalPages ? 'default' : 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function CoursesPage() {
  return (
    <div style={{ backgroundColor: '#EEF3F8', minHeight: '100vh', color: '#0B1A2E' }}>
      <NavBar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: '#5a7a96' }}>Loading...</div>}>
        <CoursesContent />
      </Suspense>
    </div>
  )
}
