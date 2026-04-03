import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'SciQuest Learning — Live Science & Math Classes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#0B1A2E',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px 100px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Teal accent bar top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            backgroundColor: '#00C2A8',
          }}
        />

        {/* Decorative circle top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            backgroundColor: '#00C2A8',
            opacity: 0.06,
          }}
        />

        {/* Decorative circle bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            left: '-60px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            backgroundColor: '#F5C842',
            opacity: 0.05,
          }}
        />

        {/* Subject pills row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '36px' }}>
          {[
            { label: 'Biology', color: '#22c55e' },
            { label: 'Chemistry', color: '#a855f7' },
            { label: 'Physical Science', color: '#3b82f6' },
            { label: 'Mathematics', color: '#f59e0b' },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                backgroundColor: color + '22',
                color,
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: '62px',
            fontWeight: 800,
            color: '#e8edf5',
            lineHeight: 1.1,
            marginBottom: '20px',
            display: 'flex',
          }}
        >
          SciQuest Learning
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '28px',
            color: '#6b88a8',
            lineHeight: 1.4,
            maxWidth: '780px',
            display: 'flex',
          }}
        >
          Live Google Meet classes for grades 8–12, taught by verified science &amp; math educators.
        </div>

        {/* URL badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            right: '100px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#00C2A8',
            }}
          />
          <div style={{ color: '#00C2A8', fontSize: '20px', fontWeight: 600, display: 'flex' }}>
            sciquestlearning.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
