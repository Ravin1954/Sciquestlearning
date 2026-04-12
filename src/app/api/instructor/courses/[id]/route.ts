import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Instructor access required' }, { status: 403 })
  }

  const { id } = await params
  const course = await prisma.course.findUnique({ where: { id } })
  if (!course || course.instructorId !== user.id) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }
  const body = await req.json()
  const {
    title, description, subject, courseType, gradeLevel,
    durationWeeks, durationUnit, feeType, startDate, daysOfWeek, startTimeUtc, sessionDurationMins,
    feeUsd, contentUrl, classroomUrl, topics, scheduleJson, recordingsJson,
  } = body

  // Only reset to PENDING if content fields changed — schedule/date changes don't need re-approval
  const contentChanged =
    title !== course.title ||
    description !== course.description ||
    subject !== course.subject ||
    courseType !== course.courseType ||
    parseFloat(feeUsd) !== Number(course.feeUsd) ||
    (contentUrl || null) !== course.contentUrl

  const updated = await prisma.course.update({
    where: { id },
    data: {
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
      classroomUrl: classroomUrl || null,
      topics: Array.isArray(topics) ? topics : [],
      scheduleJson: scheduleJson || '',
      recordingsJson: recordingsJson || '[]',
      ...(contentChanged ? { status: 'PENDING', rejectionRemark: null } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Instructor access required' }, { status: 403 })
  }

  const { id } = await params
  const course = await prisma.course.findUnique({
    where: { id },
    include: { _count: { select: { enrollments: true } } },
  })

  if (!course || course.instructorId !== user.id) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  if (course._count.enrollments > 0) {
    return NextResponse.json({ error: 'Cannot delete a course with enrolled students' }, { status: 400 })
  }

  await prisma.course.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
