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
  })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const amountCents = Math.round(Number(course.feeUsd) * 100)

  const session = await stripe.checkout.sessions.create({
    customer_email: student.email,
    billing_address_collection: 'auto',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Renew Access: ${course.title}`,
            description: '1 year access renewal',
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/student?renewed=1`,
    cancel_url: `${appUrl}/student`,
    metadata: {
      courseId,
      studentId: student.id,
      isRenewal: 'true',
    },
  })

  return NextResponse.json({ url: session.url })
}
