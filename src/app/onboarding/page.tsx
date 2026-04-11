'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import StepIndicator from '@/components/StepIndicator'

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

const STUDENT_COUNTRIES = [
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

// Instructor countries = Stripe Connect supported countries
// Stripe handles all payout compliance — if Stripe supports it, we can pay there
// Full list: https://stripe.com/global
const INSTRUCTOR_COUNTRIES = [
  'United States', 'Canada', 'Mexico',
  'United Kingdom', 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus',
  'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
  'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
  'Australia', 'New Zealand',
  'India', 'Japan', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Hong Kong',
  'South Korea', 'Philippines',
  'United Arab Emirates',
  'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru',
  'South Africa', 'Kenya', 'Ghana', 'Nigeria',
  'Jamaica', 'Trinidad and Tobago', 'Dominican Republic', 'Bahamas',
].sort()

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

  const [timezone, setTimezone] = useState('UTC')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [country, setCountry] = useState('')

  // Instructor fields
  const [qualifications, setQualifications] = useState('')
  const [aboutMe, setAboutMe] = useState('')
  const [certificatesUrl, setCertificatesUrl] = useState('')
  const [instructorFirstName, setInstructorFirstName] = useState('')
  const [instructorLastName, setInstructorLastName] = useState('')

  // Student fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [fathersName, setFathersName] = useState('')
  const [mothersName, setMothersName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.firstName) { setFirstName(user.firstName); setInstructorFirstName(user.firstName) }
    if (user.lastName) { setLastName(user.lastName); setInstructorLastName(user.lastName) }

    const existingRole = user.publicMetadata?.role as string | undefined
    if (existingRole === 'admin') router.replace('/admin')
    else if (existingRole === 'instructor') setRole('instructor')
    else if (existingRole === 'student') setRole('student')
  }, [user, router])

  // Reset country when role changes
  useEffect(() => {
    setCountry(role === 'instructor' ? 'United States' : '')
  }, [role])

  const toggleSubject = (s: string) =>
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )

  const isRoleLocked = (!!presetRole && presetRole !== 'admin') || !!roleFromUrl

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!country) { setError('Please select your country.'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          firstName: role === 'instructor' ? instructorFirstName : firstName,
          lastName: role === 'instructor' ? instructorLastName : lastName,
          timezone,
          country,
          subjects: selectedSubjects,
          qualifications: role === 'instructor' ? qualifications : undefined,
          aboutMe: role === 'instructor' ? aboutMe : undefined,
          certificatesUrl: role === 'instructor' ? certificatesUrl : undefined,
          age: role === 'student' ? age : undefined,
          gender: role === 'student' ? gender : undefined,
          fathersName: role === 'student' ? fathersName : undefined,
          mothersName: role === 'student' ? mothersName : undefined,
        }),
      })

      if (!res.ok) {
        let errorMsg = 'Failed to save profile'
        try {
          const data = await res.json()
          errorMsg = data.error || errorMsg
        } catch { /* response wasn't JSON */ }
        throw new Error(errorMsg)
      }

      await user?.reload()
      router.push(role === 'instructor' ? '/instructor' : '/student')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const countryOptions = role === 'instructor' ? INSTRUCTOR_COUNTRIES : STUDENT_COUNTRIES

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
          <p style={{ color: '#6b88a8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {role === 'instructor'
              ? 'Tell students about your qualifications and what you teach.'
              : 'Create your student profile to browse and enroll in courses.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StepIndicator currentStep={2} role={role} />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* Role toggle */}
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

          {/* Country */}
          <div>
            <p style={sectionLabel}>Location</p>
            <label style={labelStyle}>Country</label>
            <select
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select your country</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {role === 'instructor' && (
              <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                Instructor payouts via Stripe are currently supported for US-based instructors only.
              </p>
            )}
          </div>

          {/* STUDENT FIELDS */}
          {role === 'student' && (
            <>
              <div>
                <p style={sectionLabel}>Personal Information</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Sarah" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Johnson" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Age</label>
                      <input required type="number" min="10" max="20" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 14" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Gender</label>
                      <select required value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Father's Name</label>
                      <input required value={fathersName} onChange={(e) => setFathersName(e.target.value)} placeholder="e.g. Robert Johnson" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Mother's Name</label>
                      <input required value={mothersName} onChange={(e) => setMothersName(e.target.value)} placeholder="e.g. Linda Johnson" style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* INSTRUCTOR FIELDS */}
          {role === 'instructor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={sectionLabel}>Personal Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input required value={instructorFirstName} onChange={(e) => setInstructorFirstName(e.target.value)} placeholder="e.g. Sarah" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input required value={instructorLastName} onChange={(e) => setInstructorLastName(e.target.value)} placeholder="e.g. Johnson" style={inputStyle} />
                </div>
              </div>

              <p style={{ ...sectionLabel, marginTop: '0.5rem' }}>Professional Background</p>

              <div>
                <label style={labelStyle}>About Me</label>
                <textarea
                  required
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="Tell students about yourself — your teaching philosophy, experience, and what makes your classes unique..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Qualifications & Teaching Experience</label>
                <textarea
                  required
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="Describe your degrees, certifications, years of experience, and teaching style..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Degrees & Teaching Certificates</label>
                <input
                  value={certificatesUrl}
                  onChange={(e) => setCertificatesUrl(e.target.value)}
                  placeholder="Paste a Google Drive link to your certificates/degrees (optional)"
                  style={inputStyle}
                />
                <p style={{ color: '#6b88a8', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                  Upload your documents to Google Drive and share the link here. This helps us verify your credentials.
                </p>
              </div>
            </div>
          )}

          {/* Timezone */}
          <div>
            <p style={sectionLabel}>Preferences</p>
            <label style={labelStyle}>Your Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={inputStyle}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>

          {/* Subject interests */}
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
