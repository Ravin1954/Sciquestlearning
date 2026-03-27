'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const timezones = [
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

const subjectOptions = ['BIOLOGY', 'PHYSICAL_SCIENCE', 'CHEMISTRY', 'MATHEMATICS']
const subjectLabels: Record<string, string> = {
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

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()

  // If user already has a role set by admin, lock to that role
  const presetRole = user?.publicMetadata?.role as string | undefined
  const [role, setRole] = useState<'student' | 'instructor'>(
    presetRole === 'instructor' ? 'instructor' : 'student'
  )
  const [timezone, setTimezone] = useState('UTC')
  const [qualifications, setQualifications] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already fully onboarded, redirect immediately
  useEffect(() => {
    if (!user) return
    const existingRole = user.publicMetadata?.role as string | undefined
    if (existingRole === 'admin') router.replace('/admin')
    else if (existingRole === 'instructor') {
      // Has role but may not be in DB yet — let them complete profile
      setRole('instructor')
    } else if (existingRole === 'student') {
      setRole('student')
    }
  }, [user, router])

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    )
  }

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
          qualifications: role === 'instructor' ? qualifications : undefined,
          subjects: selectedSubjects,
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

  const isRoleLocked = !!presetRole && presetRole !== 'admin'

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
          maxWidth: '540px',
          backgroundColor: '#0f2240',
          border: '1px solid #1e3a5f',
          borderRadius: '16px',
          padding: '2.5rem',
        }}
      >
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <span style={{ fontFamily: 'Fraunces, serif', color: '#00C2A8', fontSize: '1.5rem', fontWeight: 700 }}>
            SciQuest
          </span>
          <span style={{ fontFamily: 'Fraunces, serif', color: '#F5C842', fontSize: '1.5rem' }}> Learning</span>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.625rem', fontWeight: 700, color: '#e8edf5', marginTop: '1rem', marginBottom: '0.375rem' }}>
            {role === 'instructor' ? 'Complete Your Instructor Profile' : 'Welcome to SciQuest!'}
          </h1>
          <p style={{ color: '#6b88a8', fontSize: '0.875rem' }}>
            {role === 'instructor'
              ? 'Tell students about your qualifications and what you teach.'
              : 'Tell us a bit about yourself to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Role — only show toggle if not pre-assigned */}
          {!isRoleLocked && (
            <div>
              <label style={labelStyle}>I am a...</label>
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

          {/* Role badge when locked */}
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

          {/* Timezone */}
          <div>
            <label style={labelStyle}>Your Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={inputStyle}>
              {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>

          {/* Subjects */}
          <div>
            <label style={labelStyle}>
              {role === 'instructor' ? 'Subjects You Teach' : "Subjects You're Interested In"}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {subjectOptions.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  style={{
                    padding: '0.625rem',
                    borderRadius: '8px',
                    border: selectedSubjects.includes(subject) ? '1px solid #00C2A8' : '1px solid #1e3a5f',
                    backgroundColor: selectedSubjects.includes(subject) ? '#003d35' : '#060f1a',
                    color: selectedSubjects.includes(subject) ? '#00C2A8' : '#6b88a8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  {subjectLabels[subject]}
                </button>
              ))}
            </div>
          </div>

          {/* Qualifications — instructor only */}
          {role === 'instructor' && (
            <div>
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
            {loading ? 'Saving...' : role === 'instructor' ? 'Complete Instructor Profile →' : 'Get Started →'}
          </button>
        </form>
      </div>
    </div>
  )
}
