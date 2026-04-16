import Link from 'next/link'
import NavBar from '@/components/NavBar'

export default function CheckoutSuccessPage() {
  return (
    <div style={{ backgroundColor: '#EEF3F8', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '2rem' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #C5D5E4',
            borderRadius: '16px',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              backgroundColor: '#003d35',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem',
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#0B1A2E',
              marginBottom: '0.75rem',
            }}
          >
            You're Enrolled!
          </h1>

          <p style={{ color: '#5a7a96', lineHeight: 1.7, marginBottom: '0.75rem' }}>
            Your payment was successful. Check your email for your Zoom meeting link and class schedule.
          </p>

          <p style={{ color: '#5a7a96', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.875rem' }}>
            You'll receive a reminder email 20 minutes before each class session.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/student"
              style={{
                backgroundColor: '#00C2A8',
                color: '#0B1A2E',
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              Go to My Dashboard →
            </Link>
            <Link
              href="/courses"
              style={{
                backgroundColor: 'transparent',
                color: '#2d4a6b',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #C5D5E4',
                fontSize: '0.9rem',
              }}
            >
              Browse More Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
