'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const COUNTRIES = [
  'United States', 'Canada', 'Mexico', 'China', 'Philippines', 'South Korea',
  'Australia', 'New Zealand', 'India', 'Japan', 'Singapore', 'Malaysia',
  'Thailand', 'Indonesia', 'Hong Kong', 'United Arab Emirates',
  'United Kingdom', 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus',
  'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
  'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania',
  'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal',
  'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
  'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru',
  'South Africa', 'Kenya', 'Ghana', 'Nigeria',
  'Jamaica', 'Trinidad and Tobago', 'Dominican Republic', 'Bahamas',
].sort()

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Toronto', 'America/Vancouver',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
  'Australia/Sydney', 'Pacific/Auckland',
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
  timezone: string
  age: number | null
  gender: string
  fathersName: string
  mothersName: string
  subjects: string[]
  createdAt: string
}

const SUBJECT_LABELS: Record<string, string> = {
  BIOLOGY: 'Biology', PHYSICAL_SCIENCE: 'Physical Science',
  CHEMISTRY: 'Chemistry', MATHEMATICS: 'Mathematics',
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ country: '', timezone: '', age: '', gender: '', fathersName: '', mothersName: '' })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/student/profile').then((r) => r.json()).then((data) => {
      setProfile(data)
      setForm({
        country: data.country || '',
        timezone: data.timezone || 'UTC',
        age: data.age ? String(data.age) : '',
        gender: data.gender || '',
        fathersName: data.fathersName || '',
        mothersName: data.mothersName || '',
      })
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/student/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await res.json()
      setProfile((prev) => prev ? { ...prev, ...updated, age: updated.age } : prev)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  return (
    <DashboardLayout role="student">
      <div style={{ maxWidth: '680px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.25rem' }}>
          My Profile
        </h1>
        <p style={{ color: '#6b88a8', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Your registration details on SciQuest Learning.
        </p>

        {!profile ? (
          <p style={{ color: '#6b88a8' }}>Loading...</p>
        ) : (
          <>
            {/* Account info */}
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
                {profile.createdAt && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Registered On</p>
                    <p style={{ color: '#a8c4e0' }}>{new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
              </div>
              <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                To change your name or email, click the Account button in the sidebar.
              </p>
            </div>

            {/* Subjects of interest */}
            {profile.subjects && profile.subjects.length > 0 && (
              <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <p style={{ color: '#6b88a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.75rem' }}>Subjects of Interest</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profile.subjects.map((s) => (
                    <span key={s} style={{ backgroundColor: '#003d35', color: '#00C2A8', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {SUBJECT_LABELS[s] || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Editable personal info */}
            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ color: '#6b88a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Personal Details
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
                  ✓ Profile updated successfully.
                </p>
              )}

              {editing ? (
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Age</p>
                      <input type="number" min="10" max="20" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} placeholder="e.g. 14" style={inp} />
                    </div>
                    <div>
                      <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Gender</p>
                      <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} style={inp}>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Father's Name</p>
                      <input value={form.fathersName} onChange={(e) => setForm((f) => ({ ...f, fathersName: e.target.value }))} placeholder="e.g. Robert Johnson" style={inp} />
                    </div>
                    <div>
                      <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Mother's Name</p>
                      <input value={form.mothersName} onChange={(e) => setForm((f) => ({ ...f, mothersName: e.target.value }))} placeholder="e.g. Linda Johnson" style={inp} />
                    </div>
                  </div>
                  <div>
                    <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Country</p>
                    <select value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} style={inp}>
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <p style={{ color: '#a8c4e0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem' }}>Timezone</p>
                    <select value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))} style={inp}>
                      {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                  {error && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{error}</p>}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" disabled={saving} style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setError('') }} style={{ backgroundColor: 'transparent', color: '#6b88a8', border: '1px solid #1e3a5f', padding: '0.625rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { label: 'Age', value: profile.age ? `${profile.age} years` : null },
                    { label: 'Gender', value: profile.gender },
                    { label: "Father's Name", value: profile.fathersName },
                    { label: "Mother's Name", value: profile.mothersName },
                    { label: 'Country', value: profile.country },
                    { label: 'Timezone', value: profile.timezone },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{label}</p>
                      <p style={{ color: value ? '#e8edf5' : '#3a5070', fontStyle: value ? 'normal' : 'italic', fontSize: '0.875rem' }}>
                        {value || 'Not provided'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
