import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendCourseRejectionEmail } from '@/lib/resend'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params
  const course = await prisma.course.findUnique({
    where: { id },
    include: { instructor: true },
  })

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.course.update({ where: { id }, data: { status: 'REJECTED' } })
  await sendCourseRejectionEmail(course.instructor.email, course.title)

  return NextResponse.json({ success: true })
}
