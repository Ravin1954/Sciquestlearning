import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendCourseApprovalEmail } from '@/lib/resend'
import { createGoogleMeetSpace } from '@/lib/google-meet'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (user?.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = await params
  const course = await prisma.course.findUnique({
    where: { id },
    include: { instructor: true },
  })

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let meetingUrl = course.zoomJoinUrl || ''

  // Auto-create a Google Meet space for live courses
  if (course.courseType === 'LIVE') {
    try {
      meetingUrl = await createGoogleMeetSpace()
    } catch (err) {
      console.error('Failed to create Google Meet space:', err)
      // Fall back to instructor-provided link if Meet API fails
    }
  }

  await prisma.course.update({
    where: { id },
    data: {
      status: 'APPROVED',
      ...(course.courseType === 'LIVE' && meetingUrl ? { zoomJoinUrl: meetingUrl, zoomStartUrl: meetingUrl } : {}),
    },
  })

  sendCourseApprovalEmail(course.instructor.email, course.title)
    .catch((err) => console.error('[email] course approval email failed:', err))

  return NextResponse.json({ success: true })
}
