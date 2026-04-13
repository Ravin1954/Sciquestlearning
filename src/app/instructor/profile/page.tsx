'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'India',
  'Germany', 'France', 'Singapore', 'New Zealand', 'Ireland',
  'South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Philippines',
  'Malaysia', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Other',
]

const inp: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px',
  backgroundColor: '#060f1a', border: '1px solid #1e3a5f',
  color: '#e8edf5', fontSize: '0.875rem', boxSizing: 'border-box',
}

interface Profile {
  firstName: string
  lastName: string
  email: string
  country: string
  qualifications: string
  aboutMe: string
  certificatesUrl: string
  instructorStatus: string
}

export default function InstructorProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ country: '', qualifications: '', aboutMe: '', certificatesUrl: '' })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/instructor/profile').then((r) => r.json()).then((data) => {
      setProfile(data)
      setForm({
        country: data.country || '',
        qualifications: data.qualifications || '',
        aboutMe: data.aboutMe || '',
        certificatesUrl: data.certificatesUrl || '',
      })
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/instructor/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await res.json()
      setProfile((prev) => prev ? { ...prev, ...updated } : prev)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    APPROVED: { bg: '#003d35', color: '#00C2A8', label: 'Approved' },
    PENDING_REVIEW: { bg: '#3d2a00', color: '#F5C842', label: 'Pending Review' },
    REJECTED: { bg: '#3d0f0f', color: '#f87171', label: 'Not Approved' },
    NOT_APPLICABLE: { bg: '#1a1a2e', color: '#6b88a8', label: 'N/A' },
  }

  return (
    <DashboardLayout role="instructor">
      <div style={{ maxWidth: '680px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' }}>
          My Profile
        </h1>
        <p style={{ color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Your instructor credentials and bio visible to students and admin.
        </p>

        {!profile ? (
          <p style={{ color: '#6b88a8' }}>Loading...</p>
        ) : (
          <>
            {/* Account info (read-only from Clerk) */}
            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ color: '#6b88a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '1rem' }}>Account Info</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>First Name</p>
                  <p style={{ color: '#e8edf5', fontWeight: 600 }}>{profile.firstName || '—'}</p>
                </div>
                <div>
                  <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Last Name</p>
                  <p style={{ color: '#e8edf5', fontWeight: 600 }}>{profile.lastName || '—'}</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Email</p>
                  <p style={{ color: '#e8edf5' }}>{profile.email || '—'}</p>
                </div>
              </div>
              <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                To change your name or email, click the Account button in the sidebar.
              </p>
            </div>

            {/* Account status */}
            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b88a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.25rem' }}>Instructor Status</p>
                <p style={{ color: '#6b88a8', fontSize: '0.8rem' }}>Admin reviews credentials before approving instructors.</p>
              </div>
              {(() => {
                const s = statusColors[profile.instructorStatus] || statusColors.NOT_APPLICABLE
                return (
                  <span style={{ backgroundColor: s.bg, color: s.color, padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                )
              })()}
            </div>

            {/* Editable credentials */}
            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ color: '#6b88a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Credentials &amp; Bio
                </p>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{ backgroundColor: 'transparent', color: '#00C2A8', border: '1px solid #00C2A8', padding: '0.35rem 0.9rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                )}
              </div>

              {saved && (
                <p style={{ color: '#00C2A8', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                  ✓ Profile saved successfully.
                </p>
              )}

              {editing ? (
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Country of Residence</p>
                    <select value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} style={inp}>
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Qualifications</p>
                    <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginBottom: '0.375rem' }}>Degrees, certifications, teaching experience</p>
                    <textarea
                      value={form.qualifications}
                      onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))}
                      rows={3}
                      placeholder="e.g. M.Sc. Biology, 5 years high school teaching experience"
                      style={{ ...inp, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>About Me</p>
                    <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginBottom: '0.375rem' }}>Shown to students on your course pages</p>
                    <textarea
                      value={form.aboutMe}
                      onChange={(e) => setForm((f) => ({ ...f, aboutMe: e.target.value }))}
                      rows={4}
                      placeholder="Tell students about your teaching style and background..."
                      style={{ ...inp, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Certificates / Credentials URL</p>
                    <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginBottom: '0.375rem' }}>Link to Google Drive, LinkedIn, or any document showing your credentials</p>
                    <input
                      type="url"
                      value={form.certificatesUrl}
                      onChange={(e) => setForm((f) => ({ ...f, certificatesUrl: e.target.value }))}
                      placeholder="https://drive.google.com/..."
                      style={inp}
                    />
                  </div>
                  {error && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{error}</p>}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" disabled={saving} style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setError('') }} style={{ backgroundColor: 'transparent', color: '#6b88a8', border: '1px solid #1e3a5f', padding: '0.625rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Country', value: profile.country },
                    { label: 'Qualifications', value: profile.qualifications },
                    { label: 'About Me', value: profile.aboutMe },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{label}</p>
                      <p style={{ color: value ? '#e8edf5' : '#3a5070', fontStyle: value ? 'normal' : 'italic' }}>
                        {value || 'Not provided'}
                      </p>
                    </div>
                  ))}
                  <div>
                    <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Certificates / Credentials URL</p>
                    {profile.certificatesUrl ? (
                      <a href={profile.certificatesUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00C2A8', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                        {profile.certificatesUrl}
                      </a>
                    ) : (
                      <p style={{ color: '#3a5070', fontStyle: 'italic' }}>Not provided</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
