import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/admin/payout
// Admin marks an enrollment as paid out after manually transferring 80% to instructor's bank account
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { enrollmentId } = await req.json()
  if (!enrollmentId) return NextResponse.json({ error: 'enrollmentId required' }, { status: 400 })

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: { include: { instructor: true } } },
  })

  if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  if (enrollment.instructorPaidOut) return NextResponse.json({ error: 'Already paid out' }, { status: 400 })

  const instructor = enrollment.course.instructor
  if (!instructor.bankInfo) {
    return NextResponse.json({ error: 'Instructor has not added bank details yet' }, { status: 400 })
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { instructorPaidOut: true, instructorPaidOutAt: new Date() },
  })

  return NextResponse.json({ ok: true, payoutUsd: enrollment.instructorPayoutUsd })
}
