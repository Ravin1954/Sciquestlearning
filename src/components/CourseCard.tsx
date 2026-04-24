import Link from 'next/link'
import StatusBadge from './StatusBadge'
import { usePathname } from 'next/navigation'

function formatLocalTime(utcTime: string): string {
  if (!utcTime) return ''
  const [h, m] = utcTime.split(':').map(Number)
  const d = new Date()
  d.setUTCHours(h, m, 0, 0)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

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
    scheduleJson?: string
    sessionDurationMins: number
    feeUsd: number | string
    feeType?: string
    startDate?: string
    imageUrl?: string | null
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    instructor?: {
      id?: string
      firstName: string
      lastName: string
    }
  }
  showStatus?: boolean
  showEnroll?: boolean
  showInstructor?: boolean
}

const subjectColors: Record<string, string> = {
  BIOLOGY: '#16a34a',
  PHYSICAL_SCIENCE: '#2563eb',
  CHEMISTRY: '#9333ea',
  MATHEMATICS: '#d97706',
}

const subjectLabels: Record<string, string> = {
  BIOLOGY: 'Biology',
  PHYSICAL_SCIENCE: 'Physical Science',
  CHEMISTRY: 'Chemistry',
  MATHEMATICS: 'Mathematics',
}

export default function CourseCard({ course, showStatus = false, showEnroll = true, showInstructor = true }: CourseCardProps) {
  const pathname = usePathname()
  const subjectColor = subjectColors[course.subject] || '#00A896'
  const isSelfPaced = course.courseType === 'SELF_PACED'
  const showInstructorLink = course.instructor?.id && !pathname?.startsWith('/instructors/')

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #C5D5E4',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {course.imageUrl && (
        <img
          src={course.imageUrl}
          alt={course.title}
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            objectPosition: 'top',
            display: 'block',
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ padding: '1.5rem', paddingTop: course.imageUrl ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="flex items-start justify-between gap-2">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            style={{
              backgroundColor: subjectColor + '18',
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
              backgroundColor: isSelfPaced ? '#F3E8FF' : '#E0F2FE',
              color: isSelfPaced ? '#7c3aed' : '#0284c7',
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
                backgroundColor: '#FEF9C3',
                color: '#92400e',
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
          color: '#0B1A2E',
          fontSize: '1.125rem',
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {course.title}
      </h3>

      {course.description && (
        <p style={{ color: '#5a7a96', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {course.description.length > 120
            ? course.description.substring(0, 120) + '...'
            : course.description}
        </p>
      )}

      {course.instructor && showInstructor && (
        <p style={{ color: '#2d4a6b', fontSize: '0.875rem' }}>
          <span style={{ color: '#5a7a96' }}>Instructor: </span>
          {showInstructorLink ? (
            <Link
              href={`/instructors/${course.instructor.id}`}
              style={{ color: '#00A896', textDecoration: 'none', fontWeight: 500 }}
            >
              {course.instructor.firstName} {course.instructor.lastName}
            </Link>
          ) : (
            <>{course.instructor.firstName} {course.instructor.lastName}</>
          )}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {isSelfPaced ? (
          <p style={{ color: '#2d4a6b', fontSize: '0.8rem' }}>
            <span style={{ color: '#5a7a96' }}>Access: </span>
            Study anytime · {course.durationWeeks > 0 ? `${course.durationWeeks} weeks` : '1 year access'}
          </p>
        ) : (
          <>
            {course.startDate && (
              <p style={{ color: '#2d4a6b', fontSize: '0.8rem' }}>
                <span style={{ color: '#5a7a96' }}>Starts: </span>
                <strong style={{ color: '#00A896' }}>
                  {new Date(course.startDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </strong>
              </p>
            )}
            <p style={{ color: '#2d4a6b', fontSize: '0.8rem' }}>
              <span style={{ color: '#5a7a96' }}>Schedule: </span>
              {course.daysOfWeek.join(', ')} at {(() => {
                if (course.scheduleJson) {
                  try {
                    const schedule = JSON.parse(course.scheduleJson)
                    const allTimes: string[] = []
                    schedule.forEach((entry: { utcTimes?: string[]; utcTime?: string }) => {
                      const times = entry.utcTimes || (entry.utcTime ? [entry.utcTime] : [])
                      times.forEach((t) => {
                        const formatted = formatLocalTime(t)
                        if (!allTimes.includes(formatted)) allTimes.push(formatted)
                      })
                    })
                    if (allTimes.length > 0) return allTimes.join(' / ')
                  } catch { /* ignore */ }
                }
                return formatLocalTime(course.startTimeUtc)
              })()}
            </p>
            <p style={{ color: '#2d4a6b', fontSize: '0.8rem' }}>
              <span style={{ color: '#5a7a96' }}>Session: </span>
              {course.sessionDurationMins} min/session
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span
          style={{
            fontFamily: 'Fraunces, serif',
            color: '#00A896',
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
              color: '#FFFFFF',
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
    </div>
  )
}
