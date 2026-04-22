import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendRefundRequestEmail } from '@/lib/resend'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const instructor = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!instructor || (instructor.role !== 'INSTRUCTOR' && instructor.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: courseId } = await params
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.instructorId !== instructor.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { enrollmentId, reason, refundAmount } = await req.json()
  if (!enrollmentId || !reason?.trim() || !refundAmount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { student: { select: { firstName: true, lastName: true, email: true } } },
  })
  if (!enrollment || enrollment.courseId !== courseId) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  }

  await sendRefundRequestEmail(
    `${instructor.firstName} ${instructor.lastName}`,
    instructor.email,
    `${enrollment.student.firstName} ${enrollment.student.lastName}`,
    enrollment.student.email,
    course.title,
    Number(enrollment.amountPaidUsd),
    Number(refundAmount),
    reason.trim(),
  )

  return NextResponse.json({ success: true })
}
