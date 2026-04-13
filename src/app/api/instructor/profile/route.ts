import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      instructorStatus: true,
      rejectionRemark: true,
      firstName: true,
      lastName: true,
      email: true,
      country: true,
      qualifications: true,
      aboutMe: true,
      certificatesUrl: true,
    },
  })

  return NextResponse.json(user || { instructorStatus: 'PENDING_REVIEW' })
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { qualifications, aboutMe, certificatesUrl, country } = body

  const user = await prisma.user.update({
    where: { clerkId: userId },
    data: {
      ...(qualifications !== undefined && { qualifications }),
      ...(aboutMe !== undefined && { aboutMe }),
      ...(certificatesUrl !== undefined && { certificatesUrl }),
      ...(country !== undefined && { country }),
    },
    select: { qualifications: true, aboutMe: true, certificatesUrl: true, country: true },
  })

  return NextResponse.json(user)
}
