import { ImageResponse } from 'next/og'

export const alt = 'SciQuest Learning — Live Science & Math Classes for Grades 6–12'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B1A2E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '32px' }}>
          <span style={{ color: '#00C2A8', fontSize: '80px', fontWeight: 700, fontFamily: 'Georgia, serif' }}>SciQuest</span>
          <span style={{ color: '#F5C842', fontSize: '80px', fontFamily: 'Georgia, serif', marginLeft: '14px' }}>Learning</span>
        </div>

        <div
          style={{
            color: '#e8edf5',
            fontSize: '34px',
            textAlign: 'center',
            maxWidth: '900px',
            marginBottom: '52px',
            lineHeight: '1.4',
            fontFamily: 'sans-serif',
          }}
        >
          Live, Interactive Science & Math Classes for Middle & High School
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '52px' }}>
          <div style={{ background: '#00C2A8', color: '#0B1A2E', padding: '12px 28px', borderRadius: '32px', fontSize: '22px', fontWeight: 600, fontFamily: 'sans-serif' }}>Biology</div>
          <div style={{ background: '#00C2A8', color: '#0B1A2E', padding: '12px 28px', borderRadius: '32px', fontSize: '22px', fontWeight: 600, fontFamily: 'sans-serif' }}>Chemistry</div>
          <div style={{ background: '#00C2A8', color: '#0B1A2E', padding: '12px 28px', borderRadius: '32px', fontSize: '22px', fontWeight: 600, fontFamily: 'sans-serif' }}>Physical Science</div>
          <div style={{ background: '#00C2A8', color: '#0B1A2E', padding: '12px 28px', borderRadius: '32px', fontSize: '22px', fontWeight: 600, fontFamily: 'sans-serif' }}>Mathematics</div>
        </div>

        <div style={{ color: '#5a7a96', fontSize: '24px', fontFamily: 'sans-serif' }}>
          sciquestlearning.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
