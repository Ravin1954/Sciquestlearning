'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
  createdAt: string
  country?: string
  timezone?: string
  // Instructor fields
  qualifications?: string
  aboutMe?: string
  certificatesUrl?: string
  instructorStatus?: string
  // Student fields
  age?: number | null
  gender?: string
  fathersName?: string
  mothersName?: string
  subjects?: string[]
  _count: { enrollments: number; courses: number }
}

const S = {
  card: { backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
}

const roleBadge: Record<string, { bg: string; color: string }> = {
  STUDENT: { bg: '#003d35', color: '#00C2A8' },
  INSTRUCTOR: { bg: '#3d2a00', color: '#F5C842' },
  ADMIN: { bg: '#1e0a3d', color: '#a855f7' },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleDelete = async (userId: string) => {
    setDeleteLoading(userId)
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setDeleteLoading(null)
    setConfirmDeleteId(null)
  }

  useEffect(() => {
    fetch('/api/admin/users').then((r) => r.json()).then((data) => {
      setUsers(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  const filtered = users.filter((u) => {
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter ? u.role === roleFilter : true
    return matchSearch && matchRole
  })

  const students = users.filter((u) => u.role === 'STUDENT').length
  const instructors = users.filter((u) => u.role === 'INSTRUCTOR').length

  return (
    <DashboardLayout role="admin">
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#0B1A2E', marginBottom: '0.25rem' }}>
        Users
      </h1>
      <p style={{ color: '#5a7a96', fontSize: '0.9rem', marginBottom: '2rem' }}>
        All registered students and instructors on the platform.
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#0B1A2E' },
          { label: 'Students', value: students, color: '#00C2A8' },
          { label: 'Instructors', value: instructors, color: '#F5C842' },
        ].map((m) => (
          <div key={m.label} style={S.card}>
            <p style={{ color: '#5a7a96', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' }}>{m.label}</p>
            <p style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.625rem 0.875rem', borderRadius: '8px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem' }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', backgroundColor: '#EEF3F8', border: '1px solid #C5D5E4', color: '#0B1A2E', fontSize: '0.875rem' }}
        >
          <option value="">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="INSTRUCTOR">Instructors</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#5a7a96', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : (
        <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #C5D5E4' }}>
                {['Name', 'Email', 'Role', 'Joined', 'Enrollments', 'Courses', ''].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#5a7a96', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#5a7a96' }}>No users found.</td></tr>
              ) : (
                filtered.map((u, i) => {
                  const badge = roleBadge[u.role] || roleBadge.STUDENT
                  const isExpanded = expandedId === u.id
                  const isInstructor = u.role === 'INSTRUCTOR'
                  const isStudent = u.role === 'STUDENT'
                  const statusColors: Record<string, string> = {
                    APPROVED: '#00C2A8', PENDING_REVIEW: '#F5C842', REJECTED: '#f87171', NOT_APPLICABLE: '#5a7a96',
                  }
                  const SUBJECT_LABELS: Record<string, string> = {
                    BIOLOGY: 'Biology', PHYSICAL_SCIENCE: 'Physical Science',
                    CHEMISTRY: 'Chemistry', MATHEMATICS: 'Mathematics',
                  }
                  return (
                    <>
                      <tr key={u.id} style={{ borderBottom: (isExpanded || i < filtered.length - 1) ? '1px solid #C5D5E4' : 'none' }}>
                        <td style={{ padding: '0.875rem 1rem', color: '#0B1A2E', fontSize: '0.875rem', fontWeight: 500 }}>
                          {(u.firstName || u.lastName) ? `${u.firstName} ${u.lastName}`.trim() : <span style={{ color: '#5a7a96', fontStyle: 'italic' }}>No name</span>}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#2d4a6b', fontSize: '0.875rem' }}>{u.email}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ backgroundColor: badge.bg, color: badge.color, borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 700 }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#5a7a96', fontSize: '0.8rem' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#2d4a6b', fontSize: '0.875rem', textAlign: 'center' }}>
                          {u._count.enrollments}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#2d4a6b', fontSize: '0.875rem', textAlign: 'center' }}>
                          {u._count.courses > 0 ? u._count.courses : '—'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {(isInstructor || isStudent) && (
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : u.id)}
                                style={{ backgroundColor: 'transparent', color: isInstructor ? '#F5C842' : '#00C2A8', border: `1px solid ${isInstructor ? '#F5C842' : '#00C2A8'}`, padding: '0.3rem 0.7rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                {isExpanded ? 'Hide' : 'Details'}
                              </button>
                            )}
                            {confirmDeleteId === u.id ? (
                              <>
                                <span style={{ color: '#f87171', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Sure?</span>
                                <button
                                  onClick={() => handleDelete(u.id)}
                                  disabled={deleteLoading === u.id}
                                  style={{ backgroundColor: '#7f1d1d', color: '#fff', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', opacity: deleteLoading === u.id ? 0.5 : 1 }}
                                >
                                  {deleteLoading === u.id ? '...' : 'Yes'}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  style={{ backgroundColor: 'transparent', color: '#2d4a6b', border: '1px solid #C5D5E4', padding: '0.3rem 0.7rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                  No
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(u.id)}
                                style={{ backgroundColor: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '0.3rem 0.7rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && isInstructor && (
                        <tr key={`${u.id}-creds`} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #C5D5E4' : 'none', backgroundColor: '#EEF3F8' }}>
                          <td colSpan={7} style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                              <div>
                                <p style={{ color: '#5a7a96', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Status</p>
                                <span style={{ color: statusColors[u.instructorStatus || 'NOT_APPLICABLE'] || '#5a7a96', fontWeight: 600, fontSize: '0.875rem' }}>
                                  {u.instructorStatus === 'APPROVED' ? 'Approved' : u.instructorStatus === 'PENDING_REVIEW' ? 'Pending Review' : u.instructorStatus === 'REJECTED' ? 'Rejected' : '—'}
                                </span>
                              </div>
                              <div>
                                <p style={{ color: '#5a7a96', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Country</p>
                                <p style={{ color: u.country ? '#0B1A2E' : '#3a5070', fontStyle: u.country ? 'normal' : 'italic', fontSize: '0.875rem' }}>{u.country || 'Not provided'}</p>
                              </div>
                              <div>
                                <p style={{ color: '#5a7a96', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Qualifications</p>
                                <p style={{ color: u.qualifications ? '#0B1A2E' : '#3a5070', fontStyle: u.qualifications ? 'normal' : 'italic', fontSize: '0.875rem', lineHeight: 1.5 }}>{u.qualifications || 'Not provided'}</p>
                              </div>
                              <div>
                                <p style={{ color: '#5a7a96', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>About Me</p>
                                <p style={{ color: u.aboutMe ? '#0B1A2E' : '#3a5070', fontStyle: u.aboutMe ? 'normal' : 'italic', fontSize: '0.875rem', lineHeight: 1.5 }}>{u.aboutMe || 'Not provided'}</p>
                              </div>
                              <div>
                                <p style={{ color: '#5a7a96', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Certificates / Credentials URL</p>
                                {u.certificatesUrl ? (
                                  <a href={u.certificatesUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00C2A8', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                                    View Document →
                                  </a>
                                ) : (
                                  <p style={{ color: '#3a5070', fontStyle: 'italic', fontSize: '0.875rem' }}>Not provided</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {isExpanded && isStudent && (
                        <tr key={`${u.id}-student`} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #C5D5E4' : 'none', backgroundColor: '#EEF3F8' }}>
                          <td colSpan={7} style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                              {[
                                { label: 'Age', value: u.age ? `${u.age} years` : null },
                                { label: 'Gender', value: u.gender },
                                { label: "Father's Name", value: u.fathersName },
                                { label: "Mother's Name", value: u.mothersName },
                                { label: 'Country', value: u.country },
                                { label: 'Timezone', value: u.timezone },
                              ].map(({ label, value }) => (
                                <div key={label}>
                                  <p style={{ color: '#5a7a96', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</p>
                                  <p style={{ color: value ? '#0B1A2E' : '#3a5070', fontStyle: value ? 'normal' : 'italic', fontSize: '0.875rem' }}>{value || 'Not provided'}</p>
                                </div>
                              ))}
                              {u.subjects && u.subjects.length > 0 && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <p style={{ color: '#5a7a96', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.375rem' }}>Subjects of Interest</p>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {u.subjects.map((s: string) => (
                                      <span key={s} style={{ backgroundColor: '#003d35', color: '#00C2A8', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                        {SUBJECT_LABELS[s] || s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
