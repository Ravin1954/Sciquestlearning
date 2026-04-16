import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendReminderEmail, sendAccessExpiryWarningEmail, sendAccessExpiredEmail } from '@/lib/resend'

// Called by Railway cron every minute
// Sends reminders for sessions starting in 19–21 minutes
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const now = new Date()
  const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = dayNames[now.getUTCDay()]

  // Get all approved courses that run today
  const courses = await prisma.course.findMany({
    where: { status: 'APPROVED' },
    include: {
      instructor: true,
      enrollments: { include: { student: true } },
    },
  })

  let sent = 0

  for (const course of courses) {
    if (!course.daysOfWeek.includes(todayName)) continue

    // Parse startTimeUtc (format: "HH:MM")
    const [hours, minutes] = course.startTimeUtc.split(':').map(Number)
    const courseMinutes = hours * 60 + minutes
    const diffMinutes = courseMinutes - nowMinutes

    if (diffMinutes >= 19 && diffMinutes <= 21) {
      const zoomUrl = course.zoomJoinUrl || ''
      const startDisplay = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} UTC`

      // Remind all enrolled students
      for (const enrollment of course.enrollments) {
        await sendReminderEmail(
          enrollment.student.email,
          course.title,
          enrollment.zoomJoinUrl || zoomUrl,
          startDisplay
        )
        sent++
      }

      // Remind instructor (with start URL)
      await sendReminderEmail(
        course.instructor.email,
        course.title,
        course.zoomStartUrl || zoomUrl,
        startDisplay
      )
      sent++
    }
  }

  // Once daily at 08:00 UTC — send access expiry warnings and expiry notifications
  let expirySent = 0
  if (now.getUTCHours() === 8 && now.getUTCMinutes() === 0) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sciquestlearning.com'
    const in29Days = new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000)
    const in31Days = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000)

    const expiringSoon = await prisma.enrollment.findMany({
      where: { accessExpiresAt: { gte: in29Days, lte: in31Days } },
      include: { student: true, course: { select: { id: true, title: true } } },
    })
    for (const e of expiringSoon) {
      const expiryDate = e.accessExpiresAt!.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      await sendAccessExpiryWarningEmail(e.student.email, e.student.firstName, e.course.title, expiryDate, `${baseUrl}/courses/${e.course.id}`).catch(() => {})
      expirySent++
    }

    const justExpired = await prisma.enrollment.findMany({
      where: { accessExpiresAt: { gte: yesterday, lte: now } },
      include: { student: true, course: { select: { id: true, title: true } } },
    })
    for (const e of justExpired) {
      await sendAccessExpiredEmail(e.student.email, e.student.firstName, e.course.title, `${baseUrl}/courses/${e.course.id}`).catch(() => {})
      expirySent++
    }
  }

  return NextResponse.json({ ok: true, remindersSent: sent, expirySent })
}
