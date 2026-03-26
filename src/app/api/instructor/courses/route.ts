import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Instructor access required' }, { status: 403 })
  }

  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    include: { _count: { select: { enrollments: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(courses)
}
