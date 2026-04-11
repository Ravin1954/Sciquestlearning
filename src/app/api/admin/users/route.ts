import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
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

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await currentUser()
  if (admin?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { userId: targetUserId } = await req.json()
  if (!targetUserId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id: targetUserId } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Delete from Prisma (cascades enrollments/courses via schema)
  await prisma.user.delete({ where: { id: targetUserId } })

  // Delete from Clerk
  try {
    const client = await clerkClient()
    await client.users.deleteUser(target.clerkId)
  } catch (err) {
    console.error('[admin delete user] Clerk delete failed:', err)
    // User is already removed from DB — Clerk failure is non-fatal
  }

  return NextResponse.json({ success: true })
}
