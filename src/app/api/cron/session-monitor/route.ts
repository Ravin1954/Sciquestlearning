import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendSessionWarningEmail } from '@/lib/resend'

// Called by Railway cron every hour
// At 24h before a session: if 0 students enrolled, send a warning email to the instructor
// Sessions are NEVER auto-cancelled — only the admin can cancel sessions manually

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type ScheduleEntry = { day: string; utcTimes?: string[]; utcTime?: string }

function parseSchedule(scheduleJson: string, daysOfWeek: string[], startTimeUtc: string): ScheduleEntry[] {
  try {
    const parsed = JSON.parse(scheduleJson)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch { /* ignore */ }
  return daysOfWeek.map((day) => ({ day, utcTimes: [startTimeUtc] }))
}

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

      // Handle week wrap
      if (sessionTotalMins <= nowTotalMins) sessionTotalMins += 7 * 1440

      const diff = sessionTotalMins - nowTotalMins
      if (diff >= windowStartMins && diff <= windowEndMins) {
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
  const courses = await prisma.course.findMany({
    where: { status: 'APPROVED', courseType: 'LIVE' },
    include: { instructor: true, enrollments: true },
  })

  let warnings = 0

  for (const course of courses) {
    // Skip if course hasn't started yet
    if (course.startDate) {
      const startDate = new Date(course.startDate)
      if (startDate > now) continue
    }

    const enrollmentCount = course.enrollments.length
    if (enrollmentCount > 0) continue // students enrolled — no warning needed

    const entries = parseSchedule(course.scheduleJson, course.daysOfWeek, course.startTimeUtc)

    // Send warning email 24h before a session if no students are enrolled
    const upcomingSessions = getSessionsInWindow(entries, 1430, 1450, now)
    for (const s of upcomingSessions) {
      await sendSessionWarningEmail(
        course.instructor.email,
        course.instructor.firstName,
        course.title,
        s.day,
        s.utcTime,
      ).catch((e) => console.error('[warning email]', e))
      warnings++
    }
  }

  return NextResponse.json({ ok: true, warnings })
}
