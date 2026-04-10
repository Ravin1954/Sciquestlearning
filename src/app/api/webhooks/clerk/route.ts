import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendNewUserNotificationEmail } from '@/lib/resend'

export async function POST(req: Request) {
  const body = await req.json()
  const { type, data } = body

  if (type === 'user.created' || type === 'user.updated') {
    const { id, first_name, last_name, email_addresses, public_metadata } = data
    const email = email_addresses?.[0]?.email_address
    if (!email) return NextResponse.json({ ok: true })

    const role = (public_metadata?.role as string) || 'STUDENT'

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        firstName: first_name || '',
        lastName: last_name || '',
        email,
        role: role.toUpperCase() as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
      },
      create: {
        clerkId: id,
        role: role.toUpperCase() as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
        firstName: first_name || '',
        lastName: last_name || '',
        email,
      },
    })

    // Notify admin of new registration
    if (type === 'user.created') {
      const name = [first_name, last_name].filter(Boolean).join(' ')
      sendNewUserNotificationEmail(name, email, role).catch(
        (err) => console.error('[email] new user notification failed:', err)
      )
    }
  }

  return NextResponse.json({ ok: true })
}
