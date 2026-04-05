import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params

  const course = await prisma.course.findUnique({
    where: { id },
    include: { _count: { select: { enrollments: true } } },
  })

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Delete enrollments first, then the course
  await prisma.enrollment.deleteMany({ where: { courseId: id } })
  await prisma.course.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
