import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Instructor access required' }, { status: 403 })
  }

  const bankInfo = user.bankInfo ? JSON.parse(user.bankInfo) : null
  return NextResponse.json({ bankInfo })
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Instructor access required' }, { status: 403 })
  }

  const body = await req.json()
  const { payoutMethod, paypalEmail, accountHolderName, bankName, routingNumber, accountNumber, accountType } = body

  if (!payoutMethod) {
    return NextResponse.json({ error: 'Payout method is required' }, { status: 400 })
  }

  if (payoutMethod === 'paypal') {
    if (!paypalEmail) return NextResponse.json({ error: 'PayPal email is required' }, { status: 400 })
  } else {
    if (!accountHolderName || !bankName || !routingNumber || !accountNumber || !accountType) {
      return NextResponse.json({ error: 'All bank fields are required' }, { status: 400 })
    }
  }

  const bankInfo = JSON.stringify(
    payoutMethod === 'paypal'
      ? { payoutMethod, paypalEmail }
      : { payoutMethod, accountHolderName, bankName, routingNumber, accountNumber, accountType }
  )

  await prisma.user.update({ where: { id: user.id }, data: { bankInfo } })
  return NextResponse.json({ success: true })
}
