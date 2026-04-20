import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createGoogleMeetSpace } from '@/lib/google-meet'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params
  const course = await prisma.course.findUnique({ where: { id } })
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (course.courseType !== 'LIVE') return NextResponse.json({ error: 'Not a live course' }, { status: 400 })

  let meetingUrl: string
  try {
    meetingUrl = await createGoogleMeetSpace()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Google Meet generation failed:', message)
    return NextResponse.json({ error: `Meet generation failed: ${message}` }, { status: 500 })
  }

  await prisma.course.update({
    where: { id },
    data: { zoomJoinUrl: meetingUrl, zoomStartUrl: meetingUrl },
  })

  await prisma.enrollment.updateMany({
    where: { courseId: id },
    data: { zoomJoinUrl: meetingUrl },
  })

  return NextResponse.json({ meetingUrl })
}
