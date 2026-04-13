'use client'

export default function FlyerPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#060f1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ color: '#6b88a8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Print this page or screenshot it for community distribution
      </p>

      <object
        data="/flyer.svg"
        type="image/svg+xml"
        style={{ width: '100%', maxWidth: '816px', borderRadius: '8px', boxShadow: '0 0 60px rgba(0,194,168,0.15)', minHeight: '1056px' }}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => window.print()}
          style={{
            backgroundColor: '#00C2A8',
            color: '#0B1A2E',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Print Flyer
        </button>
        <a
          href="/flyer.svg"
          download="SciQuest-Learning-Flyer.svg"
          style={{
            backgroundColor: 'transparent',
            color: '#F5C842',
            border: '1px solid #F5C842',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          Download SVG
        </a>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          button, a, p { display: none !important; }
        }
      `}</style>
    </div>
  )
}
