import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { sendEnrollmentConfirmationEmail } from '@/lib/resend'
import { createZoomMeeting } from '@/lib/zoom'

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
      metadata?: { courseId?: string; studentId?: string }
      payment_intent?: string
      amount_total?: number
    }
    const { courseId, studentId } = session.metadata || {}
    if (!courseId || !studentId) return NextResponse.json({ ok: true })

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    const student = await prisma.user.findUnique({ where: { id: studentId } })

    if (!course || !student) return NextResponse.json({ ok: true })

    // Create Zoom meeting if not already on course
    let zoomJoinUrl = course.zoomJoinUrl || ''
    if (!zoomJoinUrl) {
      const meeting = await createZoomMeeting(
        course.title,
        course.startTimeUtc,
        course.sessionDurationMins
      )
      zoomJoinUrl = meeting.join_url || ''
    }

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
      },
    })

    const schedule = `${course.daysOfWeek.join(', ')} at ${course.startTimeUtc} UTC`
    await sendEnrollmentConfirmationEmail(student.email, course.title, zoomJoinUrl, schedule)
  }

  return NextResponse.json({ ok: true })
}
