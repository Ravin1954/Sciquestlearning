import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const duration = searchParams.get('duration')

  const where: Record<string, unknown> = { status: 'APPROVED' }
  if (subject) where.subject = subject
  if (duration) where.durationWeeks = parseInt(duration)

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
    durationWeeks,
    daysOfWeek,
    startTimeUtc,
    sessionDurationMins,
    feeUsd,
  } = body

  const course = await prisma.course.create({
    data: {
      instructorId: user.id,
      title,
      description,
      subject,
      durationWeeks: parseInt(durationWeeks),
      daysOfWeek,
      startTimeUtc,
      sessionDurationMins: parseInt(sessionDurationMins),
      feeUsd: parseFloat(feeUsd),
      status: 'PENDING',
    },
  })

  return NextResponse.json(course, { status: 201 })
}
