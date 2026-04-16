import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      course: {
        include: { instructor: { select: { firstName: true, lastName: true } } },
      },
      feedback: true,
    },
    orderBy: { enrolledAt: 'desc' },
  })

  // For self-paced courses, keep only the most recent enrollment per course
  const seen = new Set<string>()
  const deduped = enrollments.filter((e) => {
    if (e.course.courseType === 'SELF_PACED') {
      if (seen.has(e.courseId)) return false
      seen.add(e.courseId)
    }
    return true
  })

  return NextResponse.json(deduped)
}
