import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendSessionWarningEmail, sendSessionCancelledEmail } from '@/lib/resend'

// Called by Railway cron every hour
// Multi-week courses (durationWeeks > 1):
//   - 24h before first session: warn instructor that no students enrolled, course will be cancelled
//   - After first session date/time passes with 0 enrollments: cancel all sessions
// Single-session courses: warning only, no auto-cancel

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type ScheduleEntry = { day: string; utcTimes?: string[]; utcTime?: string }

function parseSchedule(scheduleJson: string, daysOfWeek: string[], startTimeUtc: string): ScheduleEntry[] {
  try {
    const parsed = JSON.parse(scheduleJson)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch { /* ignore */ }
  return daysOfWeek.map((day) => ({ day, utcTimes: [startTimeUtc] }))
}

function getAllSessionKeys(entries: ScheduleEntry[]): string[] {
  const keys: string[] = []
  for (const entry of entries) {
    const times = entry.utcTimes || (entry.utcTime ? [entry.utcTime] : [])
    for (const t of times) {
      if (t) keys.push(`${entry.day}|${t}`)
    }
  }
  return keys
}

// Find sessions that will start within the given future window (in minutes from now)
function getSessionsInWindow(
  entries: ScheduleEntry[],
  windowStartMins: number,
  windowEndMins: number,
  now: Date,
): { day: string; utcTime: string }[] {
  const results: { day: string; utcTime: string }[] = []
  const nowTotalMins = now.getUTCDay() * 1440 + now.getUTCHours() * 60 + now.getUTCMinutes()

  for (const entry of entries) {
    const times = entry.utcTimes || (entry.utcTime ? [entry.utcTime] : [])
    const dayIdx = DAY_NAMES.indexOf(entry.day)
    if (dayIdx < 0) continue

    for (const t of times) {
      if (!t) continue
      const [h, m] = t.split(':').map(Number)
      let sessionTotalMins = dayIdx * 1440 + h * 60 + m
      if (sessionTotalMins <= nowTotalMins) sessionTotalMins += 7 * 1440
      const diff = sessionTotalMins - nowTotalMins
      if (diff >= windowStartMins && diff <= windowEndMins) {
        results.push({ day: entry.day, utcTime: t })
      }
    }
  }
  return results
}

// Find sessions that passed in the last windowMins minutes
function getRecentlyPassedSessions(
  entries: ScheduleEntry[],
  windowMins: number,
  now: Date,
): { day: string; utcTime: string }[] {
  const results: { day: string; utcTime: string }[] = []
  const nowTotalMins = now.getUTCDay() * 1440 + now.getUTCHours() * 60 + now.getUTCMinutes()

  for (const entry of entries) {
    const times = entry.utcTimes || (entry.utcTime ? [entry.utcTime] : [])
    const dayIdx = DAY_NAMES.indexOf(entry.day)
    if (dayIdx < 0) continue

    for (const t of times) {
      if (!t) continue
      const [h, m] = t.split(':').map(Number)
      const sessionTotalMins = dayIdx * 1440 + h * 60 + m
      const diff = nowTotalMins - sessionTotalMins // positive = session is in the past
      if (diff >= 0 && diff <= windowMins) {
        results.push({ day: entry.day, utcTime: t })
      }
    }
  }
  return results
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const courses = await prisma.course.findMany({
    where: { status: 'APPROVED', courseType: 'LIVE' },
    include: { instructor: true, enrollments: true },
  })

  let warnings = 0
  let cancellations = 0

  for (const course of courses) {
    const enrollmentCount = course.enrollments.length
    const isMultiWeek = course.durationWeeks > 1
    const entries = parseSchedule(course.scheduleJson, course.daysOfWeek, course.startTimeUtc)
    const startDateStr = course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : null

    // --- 24h warning: send to instructor if no students enrolled before first session ---
    // Only applies when we are exactly 24h before the course start date
    const isOneDayBeforeStart = startDateStr
      ? new Date(startDateStr + 'T00:00:00Z').getTime() - now.getTime() <= 25 * 60 * 60 * 1000 &&
        new Date(startDateStr + 'T00:00:00Z').getTime() - now.getTime() >= 23 * 60 * 60 * 1000
      : false

    if (isMultiWeek && isOneDayBeforeStart && enrollmentCount === 0) {
      const upcomingSessions = getSessionsInWindow(entries, 1380, 1500, now) // ~23-25h window
      for (const s of upcomingSessions) {
        await sendSessionWarningEmail(
          course.instructor.email,
          course.instructor.firstName,
          course.title,
          s.day,
          s.utcTime,
          s.date,
        ).catch((e) => console.error('[warning email]', e))
        warnings++
        break // one warning per course is enough
      }
    }

    // --- Post-expiry cancellation: cancel all sessions after first session date/time passes ---
    // Only for multi-week courses on their start date, after the session time has passed
    const isStartDay = startDateStr === todayStr
    if (isMultiWeek && isStartDay && enrollmentCount === 0) {
      const passedSessions = getRecentlyPassedSessions(entries, 70, now)
      if (passedSessions.length > 0) {
        const allKeys = getAllSessionKeys(entries)
        await prisma.course.update({
          where: { id: course.id },
          data: { cancelledSessionsJson: JSON.stringify(allKeys) },
        })
        await sendSessionCancelledEmail(
          course.instructor.email,
          course.instructor.firstName,
          course.title,
          `All scheduled sessions (${course.durationWeeks}-week course — no students enrolled)`,
          passedSessions[0].utcTime,
        ).catch((e) => console.error('[cancel email]', e))
        cancellations++
      }
    }
  }

  return NextResponse.json({ ok: true, warnings, cancellations })
}
