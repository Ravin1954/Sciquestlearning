import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Returns all booked sessions for the instructor's LIVE courses
// Optional ?excludeId=courseId to skip the course being edited
export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Instructor access required' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const excludeId = searchParams.get('excludeId')

  const courses = await prisma.course.findMany({
    where: {
      instructorId: user.id,
      courseType: 'LIVE',
      status: { in: ['PENDING', 'APPROVED'] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, title: true, scheduleJson: true },
  })

  // Flatten all sessions: { date, utcTime, courseTitle }
  const bookedSlots: { date: string; utcTime: string; courseTitle: string }[] = []

  for (const course of courses) {
    if (!course.scheduleJson) continue
    try {
      const schedule = JSON.parse(course.scheduleJson) as Array<{
        date: string
        utcTimes?: string[]
        utcTime?: string
      }>
      for (const session of schedule) {
        const times = session.utcTimes || (session.utcTime ? [session.utcTime] : [])
        for (const t of times) {
          bookedSlots.push({ date: session.date, utcTime: t, courseTitle: course.title })
        }
      }
    } catch { /* skip malformed */ }
  }

  return NextResponse.json(bookedSlots)
}
