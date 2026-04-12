import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { resend } from '@/lib/resend'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const instructor = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!instructor || (instructor.role !== 'INSTRUCTOR' && instructor.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const course = await prisma.course.findUnique({ where: { id } })
  if (!course || course.instructorId !== instructor.id) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const { subject, message, attachmentUrl } = await req.json()
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: id },
    include: { student: { select: { firstName: true, lastName: true, email: true } } },
  })

  if (enrollments.length === 0) {
    return NextResponse.json({ error: 'No students enrolled in this course' }, { status: 400 })
  }

  const instructorName = `${instructor.firstName} ${instructor.lastName}`
  const sanitizedMessage = message.replace(/\n/g, '<br/>')

  const emailPromises = enrollments.map((e) =>
    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: e.student.email,
      replyTo: instructor.email,
      subject: `[${course.title}] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #1a1a2e;">
          <div style="background:#0B1A2E; padding:1rem 1.5rem; border-radius:8px 8px 0 0; margin-bottom:0;">
            <p style="color:#00C2A8; font-weight:700; font-size:0.85rem; margin:0;">SciQuest Learning — Class Message</p>
          </div>
          <div style="background:#f9fafb; padding:1.5rem; border-radius:0 0 8px 8px; border:1px solid #e5e7eb;">
            <p style="margin:0 0 0.5rem; color:#374151; font-size:0.85rem;">
              <strong>Course:</strong> ${course.title}
            </p>
            <p style="margin:0 0 1.25rem; color:#374151; font-size:0.85rem;">
              <strong>From:</strong> ${instructorName}
            </p>
            <div style="background:#fff; border:1px solid #e5e7eb; border-radius:6px; padding:1rem; margin-bottom:1.25rem;">
              <p style="color:#111827; font-size:0.9rem; line-height:1.7; margin:0;">${sanitizedMessage}</p>
            </div>
            ${attachmentUrl ? `
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:0.875rem;">
              <p style="margin:0 0 0.375rem; color:#1d4ed8; font-weight:600; font-size:0.8rem;">Attachment / Resource:</p>
              <a href="${attachmentUrl}" style="color:#2563eb; font-size:0.85rem; word-break:break-all;">${attachmentUrl}</a>
            </div>
            ` : ''}
          </div>
          <p style="margin-top:1.5rem; color:#6b7280; font-size:0.75rem; text-align:center;">
            You are receiving this because you are enrolled in <strong>${course.title}</strong> on SciQuest Learning.<br/>
            Reply directly to this email to contact your instructor.
          </p>
        </div>
      `,
    })
  )

  await Promise.all(emailPromises)

  return NextResponse.json({ sent: enrollments.length })
}
