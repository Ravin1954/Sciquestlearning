import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendInstructorApprovalEmail, sendInstructorRejectionEmail } from '@/lib/resend'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const instructors = await prisma.user.findMany({
    where: { role: 'INSTRUCTOR' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      country: true, qualifications: true, aboutMe: true,
      certificatesUrl: true, subjects: true, instructorStatus: true,
      rejectionRemark: true, createdAt: true,
      _count: { select: { courses: true } },
    },
  })

  return NextResponse.json(instructors)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { instructorId, action, remark } = await req.json()

  const instructor = await prisma.user.findUnique({ where: { id: instructorId } })
  if (!instructor) return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })

  if (action === 'approve') {
    await prisma.user.update({
      where: { id: instructorId },
      data: { instructorStatus: 'APPROVED', rejectionRemark: null },
    })
    sendInstructorApprovalEmail(instructor.email, instructor.firstName).catch(console.error)
  } else if (action === 'reject') {
    await prisma.user.update({
      where: { id: instructorId },
      data: { instructorStatus: 'REJECTED', rejectionRemark: remark || null },
    })
    sendInstructorRejectionEmail(instructor.email, instructor.firstName, remark).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
