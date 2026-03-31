import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const duration = searchParams.get('duration')
  const courseType = searchParams.get('courseType')

  const where: Record<string, unknown> = { status: 'APPROVED' }
  if (subject) where.subject = subject
  if (duration) where.durationWeeks = parseInt(duration)
  if (courseType) where.courseType = courseType

  const courses = await prisma.course.findMany({
    where,
    include: { instructor: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(courses)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Instructor access required' }, { status: 403 })
  }

  const body = await req.json()
  const {
    title,
    description,
    subject,
    courseType = 'LIVE',
    durationWeeks,
    daysOfWeek,
    startTimeUtc,
    sessionDurationMins,
    feeUsd,
    contentUrl,
    meetingUrl,
  } = body

  const course = await prisma.course.create({
    data: {
      instructorId: user.id,
      title,
      description,
      subject,
      courseType,
      durationWeeks: durationWeeks ? parseInt(durationWeeks) : 0,
      daysOfWeek: daysOfWeek || [],
      startTimeUtc: startTimeUtc || '',
      sessionDurationMins: sessionDurationMins ? parseInt(sessionDurationMins) : 0,
      feeUsd: parseFloat(feeUsd),
      contentUrl: contentUrl || null,
      zoomJoinUrl: meetingUrl || null,
      status: 'PENDING',
    },
  })

  return NextResponse.json(course, { status: 201 })
}
