export default function QRCodePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0B1A2E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ color: '#6b88a8', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Print this page or screenshot it for your business card
      </p>

      {/* Business Card Front */}
      <div style={{
        width: '3.5in',
        height: '2in',
        backgroundColor: '#0B1A2E',
        border: '2px solid #00C2A8',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem',
        boxShadow: '0 0 40px rgba(0,194,168,0.15)',
      }}>
        {/* Left side — branding */}
        <div style={{ flex: 1 }}>
          <img src="/logo.svg" alt="SciQuest Learning" style={{ height: '32px', marginBottom: '0.5rem' }} />
          <p style={{ color: '#a8c4e0', fontSize: '0.65rem', lineHeight: 1.5, margin: '0.25rem 0' }}>
            Live Science & Math Classes
          </p>
          <p style={{ color: '#a8c4e0', fontSize: '0.65rem', lineHeight: 1.5, margin: 0 }}>
            for Middle & High School
          </p>
          <div style={{ marginTop: '0.6rem', borderTop: '1px solid #1e3a5f', paddingTop: '0.5rem' }}>
            <p style={{ color: '#00C2A8', fontSize: '0.62rem', margin: 0, fontWeight: 600 }}>
              sciquestlearning.com
            </p>
            <p style={{ color: '#6b88a8', fontSize: '0.6rem', margin: '0.15rem 0 0' }}>
              Biology · Chemistry · Physics · Math
            </p>
          </div>
        </div>

        {/* Right side — QR code */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '6px', borderRadius: '8px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/qrcode" alt="QR code for sciquestlearning.com" style={{ width: '80px', height: '80px', display: 'block' }} />
          </div>
          <p style={{ color: '#6b88a8', fontSize: '0.55rem', margin: 0, textAlign: 'center' }}>
            Scan to browse courses
          </p>
        </div>
      </div>

      {/* Print instructions */}
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <p style={{ color: '#a8c4e0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          Standard business card size: <strong style={{ color: '#e8edf5' }}>3.5 × 2 inches</strong>
        </p>
        <p style={{ color: '#6b88a8', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          To print: use your browser's print function (Cmd+P) and set paper size to fit, or screenshot and send to a printer.
        </p>
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
          Print This Page
        </button>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          button { display: none !important; }
          p:last-of-type { display: none !important; }
        }
      `}</style>
    </div>
  )
}
