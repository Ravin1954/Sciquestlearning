import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
