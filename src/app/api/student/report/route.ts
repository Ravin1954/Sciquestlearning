import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendStudentComplaintEmail } from '@/lib/resend'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const student = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!student || student.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { enrollmentId, issueDescription } = await req.json()
  if (!enrollmentId || !issueDescription?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: { instructor: { select: { firstName: true, lastName: true } } },
      },
    },
  })
  if (!enrollment || enrollment.studentId !== student.id) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  }

  await sendStudentComplaintEmail(
    `${student.firstName} ${student.lastName}`,
    student.email,
    enrollment.course.title,
    `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`,
    issueDescription.trim(),
  )

  return NextResponse.json({ success: true })
}
