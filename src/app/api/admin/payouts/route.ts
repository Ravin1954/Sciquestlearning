import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') return null
  return user
}

// GET: list all enrollments grouped by instructor, with payout status
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // Pending payouts: enrolled >7 days ago, not yet paid out, amount > 0
  const pending = await prisma.enrollment.findMany({
    where: {
      instructorPaidOut: false,
      enrolledAt: { lte: oneWeekAgo },
      amountPaidUsd: { gt: 0 },
    },
    include: {
      course: { select: { title: true, instructor: { select: { id: true, firstName: true, lastName: true, email: true } } } },
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { enrolledAt: 'asc' },
  })

  // Paid out history (last 50)
  const paid = await prisma.enrollment.findMany({
    where: { instructorPaidOut: true, amountPaidUsd: { gt: 0 } },
    include: {
      course: { select: { title: true, instructor: { select: { id: true, firstName: true, lastName: true, email: true } } } },
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { instructorPaidOutAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ pending, paid })
}

// POST: mark one or more enrollments as paid out
export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { enrollmentIds } = await req.json()
  if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
    return NextResponse.json({ error: 'enrollmentIds required' }, { status: 400 })
  }

  await prisma.enrollment.updateMany({
    where: { id: { in: enrollmentIds } },
    data: { instructorPaidOut: true, instructorPaidOutAt: new Date() },
  })

  return NextResponse.json({ ok: true, updated: enrollmentIds.length })
}
