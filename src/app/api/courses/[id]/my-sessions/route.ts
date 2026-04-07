import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Returns which sessions the current student is already enrolled in for this course
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ enrolledSessions: [] })

  const { id: courseId } = await params

  const student = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!student) return NextResponse.json({ enrolledSessions: [] })

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id, courseId },
    select: { selectedSessionsJson: true },
  })

  const enrolledSessions: string[] = []
  for (const e of enrollments) {
    if (e.selectedSessionsJson) {
      try {
        const sessions: string[] = JSON.parse(e.selectedSessionsJson)
        enrolledSessions.push(...sessions)
      } catch { /* ignore */ }
    }
  }

  return NextResponse.json({ enrolledSessions })
}
