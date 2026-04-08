import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Instructor access required' }, { status: 403 })
  }

  const { id } = await params
  const course = await prisma.course.findUnique({ where: { id } })
  if (!course || course.instructorId !== user.id) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const { recordingsJson } = await req.json()

  const updated = await prisma.course.update({
    where: { id },
    data: { recordingsJson: recordingsJson || '[]' },
  })

  return NextResponse.json({ recordingsJson: updated.recordingsJson })
}
