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

  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      course: {
        select: {
          title: true,
          subject: true,
          instructor: { select: { firstName: true, lastName: true, stripeAccountId: true } },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  return NextResponse.json(enrollments)
}
