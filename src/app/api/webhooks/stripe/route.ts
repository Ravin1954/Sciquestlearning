import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { sendEnrollmentConfirmationEmail } from '@/lib/resend'

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
      },
    })

    const accessLink = course.courseType === 'SELF_PACED' ? (course.contentUrl || '') : zoomJoinUrl
    const schedule = course.courseType === 'LIVE'
      ? `${course.daysOfWeek.join(', ')} at ${course.startTimeUtc} UTC`
      : 'Self-paced — access anytime'
    await sendEnrollmentConfirmationEmail(student.email, course.title, accessLink, schedule)
  }

  return NextResponse.json({ ok: true })
}
