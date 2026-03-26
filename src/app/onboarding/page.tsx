'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
]

const subjectOptions = ['BIOLOGY', 'PHYSICAL_SCIENCE', 'CHEMISTRY', 'MATHEMATICS']
const subjectLabels: Record<string, string> = {
  BIOLOGY: 'Biology',
  PHYSICAL_SCIENCE: 'Physical Science',
  CHEMISTRY: 'Chemistry',
  MATHEMATICS: 'Mathematics',
}

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [role, setRole] = useState<'student' | 'instructor'>('student')
  const [timezone, setTimezone] = useState('UTC')
  const [qualifications, setQualifications] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
      router.push('/dashboard')
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
          maxWidth: '520px',
          backgroundColor: '#0f2240',
          border: '1px solid #1e3a5f',
          borderRadius: '16px',
          padding: '2.5rem',
        }}
      >
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.5rem' }}>
            Welcome to SciQuest!
          </h1>
          <p style={{ color: '#6b88a8' }}>Tell us a bit about yourself to get started.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Role Selection */}
          <div>
            <label style={{ color: '#a8c4e0', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>
              I am a...
            </label>
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

          {/* Timezone */}
          <div>
            <label style={{ color: '#a8c4e0', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Your Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#060f1a',
                border: '1px solid #1e3a5f',
                color: '#e8edf5',
                fontSize: '0.875rem',
              }}
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {/* Subjects */}
          <div>
            <label style={{ color: '#a8c4e0', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>
              {role === 'instructor' ? 'Subjects You Teach' : 'Subjects You\'re Interested In'}
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

          {/* Qualifications (instructor only) */}
          {role === 'instructor' && (
            <div>
              <label style={{ color: '#a8c4e0', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Qualifications & Experience
              </label>
              <textarea
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="Describe your teaching credentials, degrees, certifications, and experience..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#060f1a',
                  border: '1px solid #1e3a5f',
                  color: '#e8edf5',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  fontFamily: "'DM Sans', sans-serif",
                }}
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
            {loading ? 'Saving...' : 'Complete Setup →'}
          </button>
        </form>
      </div>
    </div>
  )
}
