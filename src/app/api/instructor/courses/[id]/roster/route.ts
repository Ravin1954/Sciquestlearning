import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const instructor = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!instructor || (instructor.role !== 'INSTRUCTOR' && instructor.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const course = await prisma.course.findUnique({ where: { id } })
  if (!course || course.instructorId !== instructor.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: id },
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { enrolledAt: 'asc' },
  })

  const roster = enrollments.map((e) => ({
    studentName: `${e.student.firstName} ${e.student.lastName}`,
    email: e.student.email,
    enrolledAt: e.enrolledAt,
    sessions: e.selectedSessionsJson ? (() => { try { return JSON.parse(e.selectedSessionsJson) } catch { return [] } })() : [],
  }))

  return NextResponse.json(roster)
}
