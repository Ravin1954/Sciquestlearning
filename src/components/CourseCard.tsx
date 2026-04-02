import Link from 'next/link'
import StatusBadge from './StatusBadge'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description?: string
    subject: string
    courseType?: string
    gradeLevel?: string
    durationWeeks: number
    daysOfWeek: string[]
    startTimeUtc: string
    sessionDurationMins: number
    feeUsd: number | string
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    instructor?: {
      firstName: string
      lastName: string
    }
  }
  showStatus?: boolean
  showEnroll?: boolean
}

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

export default function CourseCard({ course, showStatus = false, showEnroll = true }: CourseCardProps) {
  const subjectColor = subjectColors[course.subject] || '#00C2A8'
  const isSelfPaced = course.courseType === 'SELF_PACED'

  return (
    <div
      style={{
        backgroundColor: '#0f2240',
        border: '1px solid #1e3a5f',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            style={{
              backgroundColor: subjectColor + '20',
              color: subjectColor,
              padding: '2px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {subjectLabels[course.subject] || course.subject}
          </span>
          <span
            style={{
              backgroundColor: isSelfPaced ? '#2d1a4a' : '#0a2240',
              color: isSelfPaced ? '#c084fc' : '#38bdf8',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {isSelfPaced ? 'Self-Paced' : 'Live'}
          </span>
          {course.gradeLevel && (
            <span
              style={{
                backgroundColor: '#1a2d4a',
                color: '#F5C842',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              {course.gradeLevel}
            </span>
          )}
        </div>
        {showStatus && course.status && <StatusBadge status={course.status} />}
      </div>

      <h3
        style={{
          fontFamily: 'Fraunces, serif',
          color: '#e8edf5',
          fontSize: '1.125rem',
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {course.title}
      </h3>

      {course.description && (
        <p style={{ color: '#6b88a8', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {course.description.length > 120
            ? course.description.substring(0, 120) + '...'
            : course.description}
        </p>
      )}

      {course.instructor && (
        <p style={{ color: '#a8c4e0', fontSize: '0.875rem' }}>
          <span style={{ color: '#6b88a8' }}>Instructor: </span>
          {course.instructor.firstName} {course.instructor.lastName}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {isSelfPaced ? (
          <p style={{ color: '#a8c4e0', fontSize: '0.8rem' }}>
            <span style={{ color: '#6b88a8' }}>Access: </span>
            Study anytime · {course.durationWeeks > 0 ? `${course.durationWeeks} weeks` : 'Lifetime access'}
          </p>
        ) : (
          <>
            <p style={{ color: '#a8c4e0', fontSize: '0.8rem' }}>
              <span style={{ color: '#6b88a8' }}>Schedule: </span>
              {course.daysOfWeek.join(', ')} at {course.startTimeUtc} UTC
            </p>
            <p style={{ color: '#a8c4e0', fontSize: '0.8rem' }}>
              <span style={{ color: '#6b88a8' }}>Session: </span>
              {course.sessionDurationMins} min/session
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span
          style={{
            fontFamily: 'Fraunces, serif',
            color: '#F5C842',
            fontSize: '1.25rem',
            fontWeight: 700,
          }}
        >
          ${Number(course.feeUsd).toFixed(2)}
        </span>

        {showEnroll && (
          <Link
            href={`/courses/${course.id}`}
            style={{
              backgroundColor: '#00C2A8',
              color: '#0B1A2E',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View & Enroll
          </Link>
        )}
      </div>
    </div>
  )
}
