import { SignUp } from '@clerk/nextjs'
import StepIndicator from '@/components/StepIndicator'

export default function StudentSignUpPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#EEF3F8',
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
        <p style={{ color: '#5a7a96', marginBottom: '1.25rem' }}>Create your student account</p>
        <StepIndicator currentStep={1} role="student" />
      </div>
      <SignUp forceRedirectUrl="/onboarding?role=student" />
    </div>
  )
}
