import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, selectedSessions } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  const student = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!student) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (student.role !== 'STUDENT') return NextResponse.json({ error: 'Only students can enroll' }, { status: 403 })

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: 'APPROVED' },
    include: { instructor: true },
  })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  if (course.instructorId === student.id) return NextResponse.json({ error: 'You cannot enroll in your own course' }, { status: 403 })

  // Prevent duplicate enrollment
  const existing = await prisma.enrollment.findFirst({
    where: { studentId: student.id, courseId },
  })
  if (existing) return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const feePerSession = Number(course.feeUsd)

  // For LIVE courses with sessions, multiply by session count
  const sessions: string[] = Array.isArray(selectedSessions) ? selectedSessions : []
  const sessionCount = sessions.length > 0 ? sessions.length : 1
  const totalFee = feePerSession * sessionCount
  const amountCents = Math.round(totalFee * 100)
  const selectedSessionsJson = sessions.length > 0 ? JSON.stringify(sessions) : ''

  // Free course — enroll directly without Stripe
  if (amountCents === 0) {
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId,
        amountPaidUsd: 0,
        instructorPayoutUsd: 0,
        platformFeeUsd: 0,
        zoomJoinUrl: course.zoomJoinUrl || null,
        selectedSessionsJson,
        instructorPaidOut: true,
        instructorPaidOutAt: new Date(),
      },
    })
    return NextResponse.json({ url: `${appUrl}/student` })
  }

  const sessionLabel = sessionCount === 1
    ? sessions[0] || course.title
    : `${sessionCount} sessions`

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: student.email,
    billing_address_collection: 'auto',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: sessionCount > 1
              ? `${sessionCount} sessions × $${feePerSession.toFixed(2)}/session`
              : sessionLabel,
          },
          unit_amount: feePerSession * 100 | 0,
        },
        quantity: sessionCount,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/courses/${courseId}`,
    metadata: {
      courseId,
      studentId: student.id,
      selectedSessionsJson,
    },
  })

  return NextResponse.json({ url: session.url })
}
