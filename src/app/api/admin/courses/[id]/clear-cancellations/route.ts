import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params
  await prisma.course.update({
    where: { id },
    data: { cancelledSessionsJson: '[]' },
  })

  return NextResponse.json({ success: true })
}
