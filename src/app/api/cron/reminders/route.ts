import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendReminderEmail } from '@/lib/resend'

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

  return NextResponse.json({ ok: true, remindersSent: sent })
}
