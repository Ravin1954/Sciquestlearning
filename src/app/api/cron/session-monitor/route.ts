import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendSessionWarningEmail, sendSessionCancelledEmail } from '@/lib/resend'

// Called by Railway cron every hour
// At 24h before: warn instructor if 0 students enrolled
// At 18h before: auto-cancel session if still 0 students

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getSessionsInWindow(
  scheduleJson: string,
  daysOfWeek: string[],
  startTimeUtc: string,
  windowStartMins: number,
  windowEndMins: number,
  now: Date,
): { day: string; utcTime: string }[] {
  const results: { day: string; utcTime: string }[] = []
  const nowTotalMins = now.getUTCDay() * 1440 + now.getUTCHours() * 60 + now.getUTCMinutes()

  // Parse schedule (supports multiple times per day)
  let entries: { day: string; utcTimes?: string[]; utcTime?: string }[] = []
  try {
    entries = JSON.parse(scheduleJson)
  } catch {
    // Fall back to single time from daysOfWeek + startTimeUtc
    entries = daysOfWeek.map((day) => ({ day, utcTimes: [startTimeUtc] }))
  }

  for (const entry of entries) {
    const times = entry.utcTimes || (entry.utcTime ? [entry.utcTime] : [])
    const dayIdx = DAY_NAMES.indexOf(entry.day)
    if (dayIdx < 0) continue

    for (const t of times) {
      if (!t) continue
      const [h, m] = t.split(':').map(Number)
      let sessionTotalMins = dayIdx * 1440 + h * 60 + m

      // Handle week wrap — if session is earlier in the week than now, add 7 days
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
    include: {
      instructor: true,
      enrollments: true,
    },
  })

  let warnings = 0
  let cancellations = 0

  for (const course of courses) {
    const enrollmentCount = course.enrollments.length
    let cancelled: string[] = []
    try { cancelled = JSON.parse(course.cancelledSessionsJson || '[]') } catch { cancelled = [] }

    // --- 24h warning window (1430–1450 min away) ---
    const warningSessions = getSessionsInWindow(
      course.scheduleJson, course.daysOfWeek, course.startTimeUtc,
      1430, 1450, now
    )
    for (const s of warningSessions) {
      const key = `${s.day}|${s.utcTime}`
      if (cancelled.includes(key)) continue
      if (enrollmentCount === 0) {
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

    // --- 18h auto-cancel window (1070–1090 min away) ---
    const cancelSessions = getSessionsInWindow(
      course.scheduleJson, course.daysOfWeek, course.startTimeUtc,
      1070, 1090, now
    )
    for (const s of cancelSessions) {
      const key = `${s.day}|${s.utcTime}`
      if (cancelled.includes(key)) continue
      if (enrollmentCount === 0) {
        cancelled.push(key)
        await prisma.course.update({
          where: { id: course.id },
          data: { cancelledSessionsJson: JSON.stringify(cancelled) },
        })
        await sendSessionCancelledEmail(
          course.instructor.email,
          course.instructor.firstName,
          course.title,
          s.day,
          s.utcTime,
        ).catch((e) => console.error('[cancel email]', e))
        cancellations++
      }
    }
  }

  return NextResponse.json({ ok: true, warnings, cancellations })
}
