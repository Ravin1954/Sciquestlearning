import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
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
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 700 }}>
          <span style={{ color: '#00C2A8' }}>SciQuest</span>
          <span style={{ color: '#F5C842' }}> Learning</span>
        </h1>
        <p style={{ color: '#5a7a96', marginTop: '0.5rem' }}>Sign in to your account</p>
      </div>
      <SignIn forceRedirectUrl="/auth/redirect" />
    </div>
  )
}
