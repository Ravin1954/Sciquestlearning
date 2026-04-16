import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendAccessExpiryWarningEmail, sendAccessExpiredEmail } from '@/lib/resend'

// Called by Railway cron once daily
// Sends 30-day warning and expiry-day notifications for self-paced course access
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sciquestlearning.com'

  // 30-day warning: accessExpiresAt is between 29 and 31 days from now
  const in29Days = new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000)
  const in31Days = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000)

  const expiringSoon = await prisma.enrollment.findMany({
    where: {
      accessExpiresAt: { gte: in29Days, lte: in31Days },
    },
    include: {
      student: true,
      course: { select: { id: true, title: true } },
    },
  })

  // Expiry-day: accessExpiresAt is within the last 25 hours
  const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000)

  const justExpired = await prisma.enrollment.findMany({
    where: {
      accessExpiresAt: { gte: yesterday, lte: now },
    },
    include: {
      student: true,
      course: { select: { id: true, title: true } },
    },
  })

  let warningSent = 0
  let expiredSent = 0

  for (const enrollment of expiringSoon) {
    const expiryDate = enrollment.accessExpiresAt!.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    const renewUrl = `${baseUrl}/courses/${enrollment.course.id}`
    await sendAccessExpiryWarningEmail(
      enrollment.student.email,
      enrollment.student.firstName,
      enrollment.course.title,
      expiryDate,
      renewUrl,
    ).catch((e) => console.error('[access-expiry] warning email failed:', e))
    warningSent++
  }

  for (const enrollment of justExpired) {
    const renewUrl = `${baseUrl}/courses/${enrollment.course.id}`
    await sendAccessExpiredEmail(
      enrollment.student.email,
      enrollment.student.firstName,
      enrollment.course.title,
      renewUrl,
    ).catch((e) => console.error('[access-expiry] expired email failed:', e))
    expiredSent++
  }

  return NextResponse.json({ ok: true, warningSent, expiredSent })
}
