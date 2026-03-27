import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { role, timezone, qualifications, subjects, age, gender, fathersName, mothersName } = body

  if (!role || !timezone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(userId)

  const firstName = clerkUser.firstName || ''
  const lastName = clerkUser.lastName || ''
  const email = clerkUser.emailAddresses[0]?.emailAddress || ''

  const dbRole = role === 'instructor' ? 'INSTRUCTOR' : 'STUDENT'

  const studentFields =
    dbRole === 'STUDENT'
      ? {
          age: age ? parseInt(age) : null,
          gender: gender || null,
          fathersName: fathersName || null,
          mothersName: mothersName || null,
        }
      : {}

  await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      role: dbRole,
      timezone,
      qualifications: qualifications || null,
      subjects: subjects || [],
      ...studentFields,
    },
    create: {
      clerkId: userId,
      role: dbRole,
      firstName,
      lastName,
      email,
      timezone,
      qualifications: qualifications || null,
      subjects: subjects || [],
      ...studentFields,
    },
  })

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  })

  return NextResponse.json({ success: true })
}
