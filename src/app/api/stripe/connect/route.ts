import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Instructor access required' }, { status: 403 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  let accountId = user.stripeAccountId
  if (!accountId) {
    const account = await stripe.accounts.create({ type: 'express' })
    accountId = account.id
    await prisma.user.update({ where: { id: user.id }, data: { stripeAccountId: accountId } })
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/instructor`,
    return_url: `${appUrl}/instructor`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: link.url })
}
