export default function MaintenancePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B1A2E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <img src="/logo.svg" alt="SciQuest Learning" style={{ height: '56px', marginBottom: '2rem' }} />
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '1rem',
          }}
        >
          Under Maintenance
        </h1>
        <p style={{ color: '#C5D5E4', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          SciQuest Learning is temporarily down for scheduled maintenance. We will be back shortly.
        </p>
        <p style={{ color: '#5a7a96', fontSize: '0.875rem' }}>
          For urgent inquiries, email us at{' '}
          <a href="mailto:admin@sciquestlearning.com" style={{ color: '#00C2A8', textDecoration: 'none' }}>
            admin@sciquestlearning.com
          </a>
        </p>
      </div>
    </div>
  )
}
