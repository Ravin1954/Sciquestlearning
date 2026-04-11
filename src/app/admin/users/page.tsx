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
  _count: { enrollments: number; courses: number }
}

const S = {
  card: { backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' } as React.CSSProperties,
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
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' }}>
        Users
      </h1>
      <p style={{ color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' }}>
        All registered students and instructors on the platform.
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#e8edf5' },
          { label: 'Students', value: students, color: '#00C2A8' },
          { label: 'Instructors', value: instructors, color: '#F5C842' },
        ].map((m) => (
          <div key={m.label} style={S.card}>
            <p style={{ color: '#6b88a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' }}>{m.label}</p>
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
          style={{ flex: 1, minWidth: '200px', padding: '0.625rem 0.875rem', borderRadius: '8px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.875rem' }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', backgroundColor: '#060f1a', border: '1px solid #1e3a5f', color: '#e8edf5', fontSize: '0.875rem' }}
        >
          <option value="">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="INSTRUCTOR">Instructors</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#6b88a8', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : (
        <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                {['Name', 'Email', 'Role', 'Joined', 'Enrollments', 'Courses', ''].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#6b88a8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b88a8' }}>No users found.</td></tr>
              ) : (
                filtered.map((u, i) => {
                  const badge = roleBadge[u.role] || roleBadge.STUDENT
                  return (
                    <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1e3a5f' : 'none' }}>
                      <td style={{ padding: '0.875rem 1rem', color: '#e8edf5', fontSize: '0.875rem', fontWeight: 500 }}>
                        {(u.firstName || u.lastName) ? `${u.firstName} ${u.lastName}`.trim() : <span style={{ color: '#6b88a8', fontStyle: 'italic' }}>No name</span>}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#a8c4e0', fontSize: '0.875rem' }}>{u.email}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 700 }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#6b88a8', fontSize: '0.8rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#a8c4e0', fontSize: '0.875rem', textAlign: 'center' }}>
                        {u._count.enrollments}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#a8c4e0', fontSize: '0.875rem', textAlign: 'center' }}>
                        {u._count.courses > 0 ? u._count.courses : '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {confirmDeleteId === u.id ? (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
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
                              style={{ backgroundColor: 'transparent', color: '#a8c4e0', border: '1px solid #1e3a5f', padding: '0.3rem 0.7rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(u.id)}
                            style={{ backgroundColor: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '0.3rem 0.7rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
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
