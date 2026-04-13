import { auth } from '@clerk/nextjs/server'
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

  return NextResponse.json(user || {})
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
