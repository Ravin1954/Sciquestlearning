import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params

  const reviews = await prisma.review.findMany({
    where: { courseId },
    include: { student: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reviews)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Student access required' }, { status: 403 })
  }

  const { id: courseId } = await params
  const { rating, comment } = await req.json()

  if (!rating || rating < 0.5 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 0.5 and 5' }, { status: 400 })
  }
  if (!comment?.trim()) {
    return NextResponse.json({ error: 'Please write a comment' }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: { courseId, studentId: user.id },
  })
  if (!enrollment) {
    return NextResponse.json({ error: 'You must be enrolled to leave a review' }, { status: 403 })
  }

  const review = await prisma.review.upsert({
    where: { courseId_studentId: { courseId, studentId: user.id } },
    update: { rating, comment: comment.trim() },
    create: { courseId, studentId: user.id, rating, comment: comment.trim() },
    include: { student: { select: { firstName: true, lastName: true } } },
  })

  return NextResponse.json(review)
}
