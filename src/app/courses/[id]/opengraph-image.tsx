import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt = 'SciQuest Learning Course'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const subjectColors: Record<string, string> = {
  BIOLOGY: '#22c55e',
  PHYSICAL_SCIENCE: '#3b82f6',
  CHEMISTRY: '#a855f7',
  MATHEMATICS: '#f59e0b',
}

const subjectLabels: Record<string, string> = {
  BIOLOGY: 'Biology',
  PHYSICAL_SCIENCE: 'Physical Science',
  CHEMISTRY: 'Chemistry',
  MATHEMATICS: 'Mathematics',
}

export default async function OgImage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      subject: true,
      gradeLevel: true,
      durationWeeks: true,
      feeUsd: true,
      instructor: { select: { firstName: true, lastName: true } },
    },
  })

  const title = course?.title ?? 'Science & Math Course'
  const subject = course?.subject ?? ''
  const color = subjectColors[subject] ?? '#00C2A8'
  const subjectLabel = subjectLabels[subject] ?? subject
  const instructorName = course
    ? `${course.instructor.firstName} ${course.instructor.lastName}`
    : 'Expert Educator'
  const fee = course ? `$${Number(course.feeUsd).toFixed(2)}` : ''
  const gradeLevel = course?.gradeLevel ?? ''

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
            backgroundColor: color,
          }}
        />

        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 0.07,
          }}
        />

        {/* Subject + grade badge row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', alignItems: 'center' }}>
          <div
            style={{
              backgroundColor: color + '22',
              color,
              padding: '6px 18px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            {subjectLabel}
          </div>
          {gradeLevel && (
            <div
              style={{
                backgroundColor: '#1a2d4a',
                color: '#F5C842',
                padding: '6px 18px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 700,
                display: 'flex',
              }}
            >
              {gradeLevel}
            </div>
          )}
        </div>

        {/* Course title */}
        <div
          style={{
            fontSize: title.length > 40 ? '44px' : '54px',
            fontWeight: 800,
            color: '#e8edf5',
            lineHeight: 1.15,
            marginBottom: '24px',
            maxWidth: '900px',
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {title}
        </div>

        {/* Instructor */}
        <div
          style={{
            fontSize: '22px',
            color: '#6b88a8',
            marginBottom: '40px',
            display: 'flex',
          }}
        >
          Taught by{' '}
          <span style={{ color: '#a8c4e0', marginLeft: '8px', display: 'flex' }}>
            {instructorName}
          </span>
        </div>

        {/* Bottom row: fee + site */}
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '100px',
            right: '100px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {fee && (
            <div
              style={{
                fontSize: '36px',
                fontWeight: 800,
                color: '#F5C842',
                display: 'flex',
              }}
            >
              {fee}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
      </div>
    ),
    { ...size }
  )
}
