import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendCourseRejectionEmail } from '@/lib/resend'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params
  const body = await _req.json().catch(() => ({}))
  const remark: string = body.remark || ''

  const course = await prisma.course.findUnique({
    where: { id },
    include: { instructor: true },
  })

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.course.update({ where: { id }, data: { status: 'REJECTED', rejectionRemark: remark || null } })

  sendCourseRejectionEmail(course.instructor.email, course.title, remark)
    .catch((err) => console.error('[email] course rejection email failed:', err))

  return NextResponse.json({ success: true })
}
