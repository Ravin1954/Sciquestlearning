import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  const student = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!student) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: 'APPROVED' },
    include: { instructor: true },
  })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Check not already enrolled
  const existing = await prisma.enrollment.findFirst({
    where: { studentId: student.id, courseId },
  })
  if (existing) return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const amountCents = Math.round(Number(course.feeUsd) * 100)
  const platformFeeCents = Math.round(amountCents * 0.2)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: course.title },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/courses/${courseId}`,
    metadata: { courseId, studentId: student.id },
    ...(course.instructor.stripeAccountId
      ? {
          payment_intent_data: {
            application_fee_amount: platformFeeCents,
            transfer_data: { destination: course.instructor.stripeAccountId },
          },
        }
      : {}),
  })

  return NextResponse.json({ url: session.url })
}
