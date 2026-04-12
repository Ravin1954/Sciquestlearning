import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { sendEnrollmentConfirmationEmail, sendEnrollmentNotificationEmail } from '@/lib/resend'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      metadata?: { courseId?: string; studentId?: string; selectedSessionsJson?: string }
      payment_intent?: string
      amount_total?: number
    }
    const { courseId, studentId, selectedSessionsJson } = session.metadata || {}
    if (!courseId || !studentId) return NextResponse.json({ ok: true })

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    const student = await prisma.user.findUnique({ where: { id: studentId } })

    if (!course || !student) return NextResponse.json({ ok: true })

    const zoomJoinUrl = course.courseType === 'LIVE' ? (course.zoomJoinUrl || '') : ''

    const amountPaid = (session.amount_total || 0) / 100
    const instructorPayout = amountPaid * 0.8
    const platformFee = amountPaid * 0.2

    await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : '',
        amountPaidUsd: amountPaid,
        instructorPayoutUsd: instructorPayout,
        platformFeeUsd: platformFee,
        zoomJoinUrl,
        selectedSessionsJson: selectedSessionsJson || '',
      },
    })

    const accessLink = course.courseType === 'SELF_PACED' ? (course.contentUrl || '') : zoomJoinUrl
    // Build schedule string from selected sessions if available
    let schedule: string
    if (selectedSessionsJson) {
      try {
        const sessions: string[] = JSON.parse(selectedSessionsJson)
        schedule = sessions.join(', ')
      } catch {
        schedule = `${course.daysOfWeek.join(', ')} at ${course.startTimeUtc} UTC`
      }
    } else {
      schedule = course.courseType === 'LIVE'
        ? `${course.daysOfWeek.join(', ')} at ${course.startTimeUtc} UTC`
        : 'Self-paced — access anytime'
    }
    await sendEnrollmentConfirmationEmail(student.email, course.title, accessLink, schedule, `${student.firstName} ${student.lastName}`, course.classroomUrl || undefined)

    // Notify admin of new enrollment
    sendEnrollmentNotificationEmail(
      `${student.firstName} ${student.lastName}`,
      student.email,
      course.title,
      amountPaid,
    ).catch((err) => console.error('[email] enrollment notification failed:', err))
  }

  return NextResponse.json({ ok: true })
}
