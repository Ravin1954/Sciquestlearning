import { SignUp } from '@clerk/nextjs'
import StepIndicator from '@/components/StepIndicator'

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
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <span style={{ color: '#00C2A8' }}>SciQuest</span>
          <span style={{ color: '#F5C842' }}> Learning</span>
        </h1>
        <p style={{ color: '#6b88a8', marginBottom: '1.25rem' }}>Apply to teach on SciQuest</p>
        <StepIndicator currentStep={1} role="instructor" />
      </div>
      <SignUp forceRedirectUrl="/onboarding?role=instructor" />
    </div>
  )
}
