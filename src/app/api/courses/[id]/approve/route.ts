import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createZoomMeeting } from '@/lib/zoom'
import { sendCourseApprovalEmail } from '@/lib/resend'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params
  const course = await prisma.course.findUnique({
    where: { id },
    include: { instructor: true },
  })

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let zoomMeetingId = course.zoomMeetingId
  let zoomJoinUrl = course.zoomJoinUrl
  let zoomStartUrl = course.zoomStartUrl

  if (!zoomMeetingId) {
    const meeting = await createZoomMeeting(
      course.title,
      course.startTimeUtc,
      course.sessionDurationMins
    )
    zoomMeetingId = String(meeting.id)
    zoomJoinUrl = meeting.join_url
    zoomStartUrl = meeting.start_url
  }

  await prisma.course.update({
    where: { id },
    data: { status: 'APPROVED', zoomMeetingId, zoomJoinUrl, zoomStartUrl },
  })

  await sendCourseApprovalEmail(course.instructor.email, course.title)

  return NextResponse.json({ success: true })
}
