import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { enrollmentId, attended, rating, comment } = await req.json()

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  })

  if (!enrollment || enrollment.studentId !== user.id) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  }

  const existing = await prisma.feedback.findUnique({ where: { enrollmentId } })
  if (existing) return NextResponse.json({ error: 'Feedback already submitted' }, { status: 400 })

  const feedback = await prisma.feedback.create({
    data: { enrollmentId, attended, rating: parseInt(rating), comment },
  })

  return NextResponse.json(feedback, { status: 201 })
}
