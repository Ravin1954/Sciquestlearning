import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendSessionWarningEmail, sendSessionCancelledEmail } from '@/lib/resend'

// Called by Railway cron every hour
// At 24h before first session: warn instructor if 0 students enrolled
// At 18h before first session: auto-cancel
//   - Multi-week course (durationWeeks > 1): cancel ALL sessions
//   - Single session course: cancel just that slot

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

// Find the earliest session across all entries (smallest diff from now)
function getEarliestSession(entries: ScheduleEntry[], now: Date): { day: string; utcTime: string } | null {
  const nowTotalMins = now.getUTCDay() * 1440 + now.getUTCHours() * 60 + now.getUTCMinutes()
  let minDiff = Infinity
  let earliest: { day: string; utcTime: string } | null = null

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
      if (diff < minDiff) { minDiff = diff; earliest = { day: entry.day, utcTime: t } }
    }
  }

  return earliest
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
  let cancellations = 0

  for (const course of courses) {
    const enrollmentCount = course.enrollments.length
    let cancelled: string[] = []
    try { cancelled = JSON.parse(course.cancelledSessionsJson || '[]') } catch { cancelled = [] }

    const entries = parseSchedule(course.scheduleJson, course.daysOfWeek, course.startTimeUtc)
    const isMultiWeek = course.durationWeeks > 1

    // --- 24h warning (1430–1450 min away) ---
    const warningSessions = getSessionsInWindow(entries, 1430, 1450, now)
    for (const s of warningSessions) {
      const key = `${s.day}|${s.utcTime}`
      if (cancelled.includes(key)) continue
      if (enrollmentCount === 0) {
        // For multi-week: only warn on the very first session
        if (isMultiWeek) {
          const earliest = getEarliestSession(entries, now)
          if (!earliest || earliest.day !== s.day || earliest.utcTime !== s.utcTime) continue
        }
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

    // --- 18h auto-cancel (1070–1090 min away) ---
    const cancelSessions = getSessionsInWindow(entries, 1070, 1090, now)
    for (const s of cancelSessions) {
      const key = `${s.day}|${s.utcTime}`
      if (cancelled.includes(key)) continue
      if (enrollmentCount === 0) {
        if (isMultiWeek) {
          // Only trigger on the first session — then cancel ALL sessions
          const earliest = getEarliestSession(entries, now)
          if (!earliest || earliest.day !== s.day || earliest.utcTime !== s.utcTime) continue

          // Cancel every session key for this course
          const allKeys = getAllSessionKeys(entries)
          const newCancelled = [...new Set([...cancelled, ...allKeys])]
          await prisma.course.update({
            where: { id: course.id },
            data: { cancelledSessionsJson: JSON.stringify(newCancelled) },
          })
          await sendSessionCancelledEmail(
            course.instructor.email,
            course.instructor.firstName,
            course.title,
            `All sessions (${course.durationWeeks}-week course)`,
            s.utcTime,
          ).catch((e) => console.error('[cancel email]', e))
        } else {
          // Single session course — cancel just this slot
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
        }
        cancellations++
      }
    }
  }

  return NextResponse.json({ ok: true, warnings, cancellations })
}
