import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      country: true,
      timezone: true,
      age: true,
      gender: true,
      fathersName: true,
      mothersName: true,
      subjects: true,
      createdAt: true,
    },
  })

  if (!user) return NextResponse.json({})

  // If name is missing in Prisma, sync it from Clerk
  if (!user.firstName && !user.lastName) {
    try {
      const clerk = await clerkClient()
      const clerkUser = await clerk.users.getUser(userId)
      const firstName = clerkUser.firstName || ''
      const lastName = clerkUser.lastName || ''
      if (firstName || lastName) {
        await prisma.user.update({
          where: { clerkId: userId },
          data: { firstName, lastName },
        })
        return NextResponse.json({ ...user, firstName, lastName })
      }
    } catch { /* ignore clerk sync errors */ }
  }

  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { country, timezone, age, gender, fathersName, mothersName } = body

  const user = await prisma.user.update({
    where: { clerkId: userId },
    data: {
      ...(country !== undefined && { country }),
      ...(timezone !== undefined && { timezone }),
      ...(age !== undefined && { age: age ? parseInt(age) : null }),
      ...(gender !== undefined && { gender }),
      ...(fathersName !== undefined && { fathersName }),
      ...(mothersName !== undefined && { mothersName }),
    },
    select: { country: true, timezone: true, age: true, gender: true, fathersName: true, mothersName: true },
  })

  return NextResponse.json(user)
}
