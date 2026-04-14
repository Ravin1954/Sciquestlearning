import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const instructor = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      country: true,
      qualifications: true,
      aboutMe: true,
      subjects: true,
      instructorStatus: true,
      courses: {
        where: { status: 'APPROVED' },
        select: {
          id: true,
          title: true,
          description: true,
          subject: true,
          courseType: true,
          gradeLevel: true,
          durationWeeks: true,
          daysOfWeek: true,
          startTimeUtc: true,
          scheduleJson: true,
          sessionDurationMins: true,
          feeUsd: true,
          feeType: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!instructor || instructor.instructorStatus !== 'APPROVED') {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
  }

  return NextResponse.json(instructor)
}
