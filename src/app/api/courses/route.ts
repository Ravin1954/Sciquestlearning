import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendAdminNewCourseEmail } from '@/lib/resend'

export const maxDuration = 30

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const duration = searchParams.get('duration')
  const courseType = searchParams.get('courseType')
  const gradeLevel = searchParams.get('gradeLevel')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: 'APPROVED' }
  if (subject) where.subject = subject
  if (duration) where.durationWeeks = parseInt(duration)
  if (courseType) where.courseType = courseType
  if (gradeLevel) where.gradeLevel = gradeLevel

  try {
    const courses = await prisma.course.findMany({
      where,
      include: { instructor: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(courses)
  } catch (err) {
    console.error('[courses GET]', err)
    return NextResponse.json([], { status: 200 })
  }
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
    gradeLevel,
    durationWeeks,
    durationUnit = 'WEEKS',
    feeType = 'PER_SESSION',
    startDate = '',
    daysOfWeek,
    startTimeUtc,
    sessionDurationMins,
    feeUsd,
    contentUrl,
    topics,
    scheduleJson,
  } = body

  const course = await prisma.course.create({
    data: {
      instructorId: user.id,
      title,
      description,
      subject,
      courseType,
      gradeLevel: gradeLevel || '',
      durationWeeks: durationWeeks ? parseInt(durationWeeks) : 0,
      durationUnit: durationUnit || 'WEEKS',
      feeType: feeType || 'PER_SESSION',
      startDate: startDate || '',
      daysOfWeek: daysOfWeek || [],
      startTimeUtc: startTimeUtc || '',
      sessionDurationMins: sessionDurationMins ? parseInt(sessionDurationMins) : 0,
      feeUsd: parseFloat(feeUsd),
      contentUrl: contentUrl || null,
      topics: Array.isArray(topics) ? topics : [],
      scheduleJson: scheduleJson || '',
      status: 'PENDING',
    },
  })

  // Notify admin of new submission (non-blocking)
  sendAdminNewCourseEmail(
    `${user.firstName} ${user.lastName}`,
    user.email,
    title,
    subject,
  ).catch((err) => console.error('[email] admin new course notification failed:', err))

  return NextResponse.json(course, { status: 201 })
}
