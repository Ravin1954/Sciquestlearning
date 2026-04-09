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

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { enrollments: true, courses: true } },
    },
  })

  return NextResponse.json(users)
}
