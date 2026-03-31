import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const [
    totalStudents,
    totalInstructors,
    totalCourses,
    pendingCourses,
    totalEnrollments,
    revenueResult,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: 'PENDING' } }),
    prisma.enrollment.count(),
    prisma.enrollment.aggregate({ _sum: { amountPaidUsd: true, platformFeeUsd: true } }),
  ])

  return NextResponse.json({
    totalStudents,
    totalInstructors,
    totalCourses,
    pendingCourses,
    totalEnrollments,
    totalRevenue: revenueResult._sum.amountPaidUsd || 0,
    platformRevenue: revenueResult._sum.platformFeeUsd || 0,
  })
}
