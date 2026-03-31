import { SignUp } from '@clerk/nextjs'

export default function InstructorSignUpPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B1A2E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700 }}>
          <span style={{ color: '#00C2A8' }}>SciQuest</span>
          <span style={{ color: '#F5C842' }}> Learning</span>
        </h1>
        <p style={{ color: '#6b88a8', marginTop: '0.5rem' }}>Apply to teach on SciQuest</p>
      </div>
      <SignUp forceRedirectUrl="/onboarding?role=instructor" />
    </div>
  )
}
