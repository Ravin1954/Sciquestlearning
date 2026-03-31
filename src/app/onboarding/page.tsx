'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
]

const SUBJECTS = ['BIOLOGY', 'PHYSICAL_SCIENCE', 'CHEMISTRY', 'MATHEMATICS']
const SUBJECT_LABELS: Record<string, string> = {
  BIOLOGY: 'Biology',
  PHYSICAL_SCIENCE: 'Physical Science',
  CHEMISTRY: 'Chemistry',
  MATHEMATICS: 'Mathematics',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  backgroundColor: '#060f1a',
  border: '1px solid #1e3a5f',
  color: '#e8edf5',
  fontSize: '0.875rem',
  fontFamily: "'DM Sans', sans-serif",
}

const labelStyle: React.CSSProperties = {
  color: '#a8c4e0',
  fontSize: '0.875rem',
  fontWeight: 600,
  display: 'block',
  marginBottom: '0.5rem',
}

const sectionLabel: React.CSSProperties = {
  color: '#6b88a8',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 700,
  marginBottom: '0.75rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid #1e3a5f',
}

function OnboardingContent() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleFromUrl = searchParams.get('role') as 'student' | 'instructor' | null

  const presetRole = user?.publicMetadata?.role as string | undefined
  const [role, setRole] = useState<'student' | 'instructor'>(
    presetRole === 'instructor' || roleFromUrl === 'instructor' ? 'instructor' : 'student'
  )

  // Shared fields
  const [timezone, setTimezone] = useState('UTC')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  // Instructor fields
  const [qualifications, setQualifications] = useState('')

  // Student fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [fathersName, setFathersName] = useState('')
  const [mothersName, setMothersName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill name from Clerk if available
  useEffect(() => {
    if (!user) return
    if (user.firstName) setFirstName(user.firstName)
    if (user.lastName) setLastName(user.lastName)

    const existingRole = user.publicMetadata?.role as string | undefined
    if (existingRole === 'admin') router.replace('/admin')
    else if (existingRole === 'instructor') setRole('instructor')
    else if (existingRole === 'student') setRole('student')
  }, [user, router])

  const toggleSubject = (s: string) =>
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )

  const isRoleLocked = (!!presetRole && presetRole !== 'admin') || !!roleFromUrl

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          timezone,
          subjects: selectedSubjects,
          // instructor
          qualifications: role === 'instructor' ? qualifications : undefined,
          // student
          age: role === 'student' ? age : undefined,
          gender: role === 'student' ? gender : undefined,
          fathersName: role === 'student' ? fathersName : undefined,
          mothersName: role === 'student' ? mothersName : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save profile')
      }

      await user?.reload()
      router.push(role === 'instructor' ? '/instructor' : '/student')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B1A2E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: '#0f2240',
          border: '1px solid #1e3a5f',
          borderRadius: '16px',
          padding: '2.5rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'Fraunces, serif', color: '#00C2A8', fontSize: '1.5rem', fontWeight: 700 }}>SciQuest</span>
            <span style={{ fontFamily: 'Fraunces, serif', color: '#F5C842', fontSize: '1.5rem' }}> Learning</span>
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.375rem' }}>
            {role === 'instructor' ? 'Complete Your Instructor Profile' : 'Student Registration'}
          </h1>
          <p style={{ color: '#6b88a8', fontSize: '0.875rem' }}>
            {role === 'instructor'
              ? 'Tell students about your qualifications and what you teach.'
              : 'Create your student profile to browse and enroll in courses.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* Role toggle — hidden if pre-assigned */}
          {!isRoleLocked && (
            <div>
              <p style={sectionLabel}>Account Type</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: 'student', label: '🎓 Student', desc: 'I want to learn' },
                  { value: 'instructor', label: '👩‍🏫 Instructor', desc: 'I want to teach' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value as 'student' | 'instructor')}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      border: role === value ? '2px solid #00C2A8' : '2px solid #1e3a5f',
                      backgroundColor: role === value ? '#003d35' : '#060f1a',
                      color: role === value ? '#00C2A8' : '#6b88a8',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Locked role badge */}
          {isRoleLocked && (
            <div style={{ backgroundColor: '#003d35', border: '1px solid #00C2A8', borderRadius: '10px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{role === 'instructor' ? '👩‍🏫' : '🎓'}</span>
              <div>
                <p style={{ color: '#00C2A8', fontWeight: 600, fontSize: '0.875rem' }}>
                  {role === 'instructor' ? 'Instructor Account' : 'Student Account'}
                </p>
                <p style={{ color: '#6b88a8', fontSize: '0.75rem' }}>Your role has been assigned by the platform.</p>
              </div>
            </div>
          )}

          {/* ── STUDENT FIELDS ── */}
          {role === 'student' && (
            <>
              <div>
                <p style={sectionLabel}>Personal Information</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Name row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Sarah"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Johnson"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Age + Gender row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Age</label>
                      <input
                        required
                        type="number"
                        min="10"
                        max="20"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 14"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Gender</label>
                      <select
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Parents row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Father's Name</label>
                      <input
                        required
                        value={fathersName}
                        onChange={(e) => setFathersName(e.target.value)}
                        placeholder="e.g. Robert Johnson"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Mother's Name</label>
                      <input
                        required
                        value={mothersName}
                        onChange={(e) => setMothersName(e.target.value)}
                        placeholder="e.g. Linda Johnson"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── INSTRUCTOR FIELDS ── */}
          {role === 'instructor' && (
            <div>
              <p style={sectionLabel}>Professional Background</p>
              <label style={labelStyle}>Qualifications & Teaching Experience</label>
              <textarea
                required
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="Describe your degrees, certifications, years of experience, and teaching style..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          )}

          {/* ── SHARED: Timezone ── */}
          <div>
            <p style={sectionLabel}>Preferences</p>
            <label style={labelStyle}>Your Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={inputStyle}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>

          {/* ── SHARED: Subject interests ── */}
          <div>
            <label style={labelStyle}>
              {role === 'instructor' ? 'Subjects You Teach' : 'Subjects of Interest'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  style={{
                    padding: '0.625rem',
                    borderRadius: '8px',
                    border: selectedSubjects.includes(s) ? '1px solid #00C2A8' : '1px solid #1e3a5f',
                    backgroundColor: selectedSubjects.includes(s) ? '#003d35' : '#060f1a',
                    color: selectedSubjects.includes(s) ? '#00C2A8' : '#6b88a8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  {SUBJECT_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '0.875rem', backgroundColor: '#3d0f0f', padding: '0.75rem', borderRadius: '8px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#005040' : '#00C2A8',
              color: '#0B1A2E',
              padding: '0.875rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
            }}
          >
            {loading
              ? 'Saving...'
              : role === 'instructor'
              ? 'Complete Instructor Profile →'
              : 'Complete Registration →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0B1A2E' }} />}>
      <OnboardingContent />
    </Suspense>
  )
}
