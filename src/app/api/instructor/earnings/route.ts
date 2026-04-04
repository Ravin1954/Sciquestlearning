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

  const enrollments = await prisma.enrollment.findMany({
    where: { course: { instructorId: user.id } },
    include: { course: { select: { title: true } }, student: { select: { firstName: true, lastName: true } } },
    orderBy: { enrolledAt: 'desc' },
  })

  const totals = await prisma.enrollment.aggregate({
    where: { course: { instructorId: user.id } },
    _sum: { amountPaidUsd: true, instructorPayoutUsd: true, platformFeeUsd: true },
  })

  return NextResponse.json({
    enrollments,
    grossRevenue: totals._sum.amountPaidUsd || 0,
    netPayout: totals._sum.instructorPayoutUsd || 0,
    platformFee: totals._sum.platformFeeUsd || 0,
    stripeConnected: !!user.stripeAccountId,
  })
}
