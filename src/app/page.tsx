import Link from 'next/link'
import NavBar from '@/components/NavBar'

const subjects = [
  {
    name: 'Biology',
    icon: '🧬',
    description: 'Cell biology, genetics, ecosystems, and the science of living organisms.',
    color: '#22c55e',
  },
  {
    name: 'Physical Science',
    icon: '⚛️',
    description: 'Forces, motion, energy, waves, and the fundamental laws of the universe.',
    color: '#3b82f6',
  },
  {
    name: 'Chemistry',
    icon: '🧪',
    description: 'Atomic structure, chemical reactions, periodic table, and molecular bonding.',
    color: '#a855f7',
  },
  {
    name: 'Mathematics',
    icon: '📐',
    description: 'Algebra, geometry, pre-calculus, and advanced mathematical thinking.',
    color: '#f59e0b',
  },
]

const features = [
  {
    icon: '🎥',
    title: 'Live Google Meet Sessions',
    description: 'Real-time interactive classes with verified educators. Ask questions, get answers instantly.',
  },
  {
    icon: '✅',
    title: 'Verified Instructors',
    description: 'Every instructor is reviewed and approved before teaching on our platform.',
  },
  {
    icon: '📅',
    title: 'Flexible Scheduling',
    description: 'Find courses that fit your schedule — morning, evening, weekdays or weekends.',
  },
  {
    icon: '🏆',
    title: 'Expert Curriculum',
    description: 'Courses designed to complement school curriculum and prepare for standardized tests.',
  },
  {
    icon: '💳',
    title: 'Secure Payments',
    description: 'Pay safely with Stripe. Receive automatic refunds for cancelled classes.',
  },
  {
    icon: '📧',
    title: 'Email Reminders',
    description: 'Never miss a class with automated reminders 20 minutes before each session.',
  },
]

export default function HomePage() {
  return (
    <div style={{ backgroundColor: '#0B1A2E', minHeight: '100vh' }}>
      <NavBar />

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #060f1a 0%, #0B1A2E 100%)',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#003d35',
              color: '#00C2A8',
              padding: '0.375rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              marginBottom: '1.5rem',
            }}
          >
            LIVE INTERACTIVE LEARNING
          </div>

          <h1
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: '#e8edf5',
              lineHeight: 1.2,
              marginBottom: '1.5rem',
            }}
          >
            Live Science & Math Classes for{' '}
            <span style={{ color: '#00C2A8' }}>Middle & High School</span>{' '}
            Students
          </h1>

          <p
            style={{
              color: '#a8c4e0',
              fontSize: '1.125rem',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
            }}
          >
            Connect with verified science educators for live, interactive Google Meet sessions.
            Biology, Chemistry, Physical Science, and Mathematics — tailored for grades 6–12.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/courses"
              style={{
                backgroundColor: '#00C2A8',
                color: '#0B1A2E',
                padding: '0.875rem 2.5rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ backgroundColor: '#0f2240', borderTop: '1px solid #1e3a5f', borderBottom: '1px solid #1e3a5f', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {[
            { value: '50+', label: 'Verified Instructors' },
            { value: '200+', label: 'Live Courses' },
            { value: '1,500+', label: 'Students Enrolled' },
            { value: '4.9★', label: 'Average Rating' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#F5C842' }}>{stat.value}</div>
              <div style={{ color: '#6b88a8', fontSize: '0.875rem', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects Section */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.75rem' }}>
              Subjects We Cover
            </h2>
            <p style={{ color: '#6b88a8', fontSize: '1rem' }}>
              Expert instruction across the core science and mathematics disciplines
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {subjects.map((subject) => (
              <div
                key={subject.name}
                style={{
                  backgroundColor: '#0f2240',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{subject.icon}</div>
                <h3
                  style={{
                    fontFamily: 'Fraunces, serif',
                    color: subject.color,
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '0.375rem',
                  }}
                >
                  {subject.name}
                </h3>
                <p style={{ color: '#6b88a8', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {subject.description}
                </p>
              </div>
            ))}

            {/* Self-Paced card */}
            <Link
              href="/courses?type=SELF_PACED"
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  backgroundColor: '#0f2240',
                  border: '2px solid #00C2A8',
                  borderRadius: '12px',
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  height: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎓</div>
                <h3
                  style={{
                    fontFamily: 'Fraunces, serif',
                    color: '#00C2A8',
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '0.375rem',
                  }}
                >
                  Self-Paced Courses
                </h3>
                <p style={{ color: '#6b88a8', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  Learn at your own pace with pre-recorded lessons and lifetime access.
                </p>
                <span style={{ color: '#00C2A8', fontSize: '0.78rem', fontWeight: 600 }}>Browse Self-Paced →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: '#060f1a' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.75rem' }}>
              Why SciQuest Learning?
            </h2>
            <p style={{ color: '#6b88a8', fontSize: '1rem' }}>
              Everything students and educators need for a great learning experience
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  backgroundColor: '#0f2240',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  gap: '1rem',
                }}
              >
                <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>{feature.icon}</div>
                <div>
                  <h3 style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '0.375rem' }}>{feature.title}</h3>
                  <p style={{ color: '#6b88a8', fontSize: '0.875rem', lineHeight: 1.6 }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two-path CTA Section */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.75rem' }}>
              Join SciQuest Learning
            </h2>
            <p style={{ color: '#6b88a8', fontSize: '1rem' }}>Choose your path to get started</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Student Card */}
            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.75rem' }}>
                I&apos;m a Student
              </h3>
              <p style={{ color: '#6b88a8', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                Browse courses from verified instructors, enroll, and join live Google Meet sessions.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/sign-up/student" style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', padding: '0.875rem', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'block' }}>
                  Create Student Account
                </Link>
                <Link href="/sign-in" style={{ backgroundColor: 'transparent', color: '#a8c4e0', padding: '0.875rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', border: '1px solid #1e3a5f', display: 'block' }}>
                  Student Sign In
                </Link>
              </div>
            </div>
            {/* Instructor Card */}
            <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👩‍🏫</div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', fontWeight: 700, color: '#e8edf5', marginBottom: '0.75rem' }}>
                I&apos;m an Instructor
              </h3>
              <p style={{ color: '#6b88a8', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                Create courses, set your schedule, and earn 80% of every enrollment fee.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/sign-up/instructor" style={{ backgroundColor: '#F5C842', color: '#0B1A2E', padding: '0.875rem', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'block' }}>
                  Apply as Instructor
                </Link>
                <Link href="/sign-in" style={{ backgroundColor: 'transparent', color: '#a8c4e0', padding: '0.875rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', border: '1px solid #1e3a5f', display: 'block' }}>
                  Instructor Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#060f1a', borderTop: '1px solid #1e3a5f', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <a href="/courses" style={{ color: '#6b88a8', fontSize: '0.8rem', textDecoration: 'none' }}>Browse Courses</a>
          <a href="/class-policies" style={{ color: '#6b88a8', fontSize: '0.8rem', textDecoration: 'none' }}>Class Policies</a>
        </div>
        <p style={{ color: '#6b88a8', fontSize: '0.875rem' }}>
          © 2026 SciQuest Learning. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
