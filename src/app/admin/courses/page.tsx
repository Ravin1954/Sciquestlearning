'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatusBadge from '@/components/StatusBadge'

interface Course {
  id: string
  title: string
  description: string
  subject: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  courseType: 'LIVE' | 'SELF_PACED'
  feeUsd: number
  feeType: string
  durationWeeks: number
  gradeLevel: string
  startDate: string
  daysOfWeek: string[]
  startTimeUtc: string
  sessionDurationMins: number
  contentUrl: string | null
  imageUrl: string | null
  topics: string[]
  rejectionRemark: string | null
  createdAt: string
  instructor: { firstName: string; lastName: string; email: string }
  _count: { enrollments: number }
}

const S = {
  card: { backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
  btn: (color: string, bg: string) => ({
    backgroundColor: bg, color, border: 'none', borderRadius: '6px',
    padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
  } as React.CSSProperties),
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetch('/api/admin/courses').then((r) => r.json()).then((data) => {
      setCourses(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  const handleDelete = async (courseId: string) => {
    setDeleteLoading(courseId)
    await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' })
    setCourses((prev) => prev.filter((c) => c.id !== courseId))
    setDeleteLoading(null)
    setConfirmDeleteId(null)
  }

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      `${c.instructor.firstName} ${c.instructor.lastName}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter ? c.status === statusFilter : true
    const matchType = typeFilter ? c.courseType === typeFilter : true
    return matchSearch && matchStatus && matchType
  })

  const counts = {
    total: courses.length,
    approved: courses.filter((c) => c.status === 'APPROVED').length,
    pending: courses.filter((c) => c.status === 'PENDING').length,
    rejected: courses.filter((c) => c.status === 'REJECTED').length,
  }

  return (
    <DashboardLayout role="admin">
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0B1A2E', marginBottom: '0.25rem' }}>
        All Courses
      </h1>
      <p style={{ color: '#5a7a96', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Every course on the platform — approved, pending, and modification requests.
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total', value: counts.total, color: '#0B1A2E' },
          { label: 'Approved', value: counts.approved, color: '#00C2A8' },
          { label: 'Pending', value: counts.pending, color: '#F5C842' },
          { label: 'Modifications', value: counts.rejected, color: '#fbbf24' },
        ].map((m) => (
          <div key={m.label} style={S.card}>
            <p style={{ color: '#5a7a96', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' }}>{m.label}</p>
            <p style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by title or instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.625rem 0.875rem', borderRadius: '8px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem' }}>
          <option value="">All Status</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Modifications Requested</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem' }}>
          <option value="">All Types</option>
          <option value="LIVE">Live</option>
          <option value="SELF_PACED">Self-Paced</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#5a7a96', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', color: '#5a7a96', padding: '3rem' }}>No courses found.</div>
          ) : filtered.map((c) => (
            <div key={c.id} style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <p style={{ color: '#0B1A2E', fontWeight: 600, fontSize: '0.95rem' }}>{c.title}</p>
                    <StatusBadge status={c.status} hasRemark={!!c.rejectionRemark} />
                    <span style={{ color: c.courseType === 'SELF_PACED' ? '#00C2A8' : '#F5C842', fontSize: '0.72rem', fontWeight: 700 }}>
                      {c.courseType === 'SELF_PACED' ? 'Self-Paced' : 'Live'}
                    </span>
                  </div>
                  <p style={{ color: '#5a7a96', fontSize: '0.8rem' }}>
                    {c.subject.replace('_', ' ')} · {c.durationWeeks} weeks · ${Number(c.feeUsd).toFixed(2)} · {c._count.enrollments} enrolled
                  </p>
                  <p style={{ color: '#5a7a96', fontSize: '0.8rem' }}>
                    by {c.instructor.firstName} {c.instructor.lastName} ({c.instructor.email})
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => setViewingId(viewingId === c.id ? null : c.id)}
                    style={{ ...S.btn('#0B1A2E', 'transparent'), border: '1px solid #C5D5E4' }}
                  >
                    {viewingId === c.id ? 'Hide Details' : 'View Details'}
                  </button>
                  {confirmDeleteId === c.id ? (
                    <>
                      <span style={{ color: '#f87171', fontSize: '0.75rem' }}>Sure?</span>
                      <button onClick={() => handleDelete(c.id)} disabled={deleteLoading === c.id}
                        style={{ ...S.btn('#fff', '#7f1d1d'), opacity: deleteLoading === c.id ? 0.5 : 1 }}>
                        {deleteLoading === c.id ? '...' : 'Yes'}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} style={{ ...S.btn('#5a7a96', 'transparent'), border: '1px solid #C5D5E4' }}>No</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(c.id)} style={{ ...S.btn('#f87171', 'transparent'), border: '1px solid #f87171' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {viewingId === c.id && (
                <div style={{ borderTop: '1px solid #C5D5E4', paddingTop: '0.875rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {c.imageUrl && (
                    <img src={c.imageUrl} alt="Course thumbnail" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', objectPosition: 'top', borderRadius: '8px' }} />
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem' }}>
                    {[
                      { label: 'Grade Level', value: c.gradeLevel || '—' },
                      { label: 'Start Date', value: c.startDate || '—' },
                      { label: 'Days', value: c.daysOfWeek?.join(', ') || '—' },
                      { label: 'Start Time (UTC)', value: c.startTimeUtc || '—' },
                      { label: 'Session Duration', value: c.sessionDurationMins ? `${c.sessionDurationMins} min` : '—' },
                      { label: 'Fee Type', value: c.feeType?.replace('_', ' ') || '—' },
                      { label: 'Topics', value: c.topics?.join(', ') || '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p style={{ color: '#5a7a96', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>{label}</p>
                        <p style={{ color: '#0B1A2E', fontSize: '0.8rem' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ color: '#5a7a96', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Description</p>
                    <p style={{ color: '#0B1A2E', fontSize: '0.825rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.description || '—'}</p>
                  </div>
                  {c.contentUrl && (
                    <div>
                      <p style={{ color: '#5a7a96', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Content URL</p>
                      <a href={c.contentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00C2A8', fontSize: '0.8rem', wordBreak: 'break-all' }}>{c.contentUrl}</a>
                    </div>
                  )}
                  {c.rejectionRemark && (
                    <div style={{ backgroundColor: '#2d1b00', border: '1px solid #d97706', borderRadius: '8px', padding: '0.75rem' }}>
                      <p style={{ color: '#fbbf24', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Modification Notes</p>
                      <p style={{ color: '#fde68a', fontSize: '0.8rem' }}>{c.rejectionRemark}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
