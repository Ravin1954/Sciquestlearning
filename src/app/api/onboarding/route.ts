import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const ALLOWED_STUDENT_COUNTRIES = new Set([
  'United States', 'Canada', 'Mexico', 'China', 'Philippines', 'South Korea',
  'Australia', 'New Zealand', 'India', 'Japan', 'Singapore', 'Malaysia',
  'Thailand', 'Indonesia', 'Hong Kong', 'United Arab Emirates',
  'United Kingdom', 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus',
  'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
  'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania',
  'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal',
  'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
  'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru',
  'South Africa', 'Kenya', 'Ghana', 'Nigeria',
  'Jamaica', 'Trinidad and Tobago', 'Dominican Republic', 'Bahamas',
])

// Instructor countries = Stripe Connect supported countries
// Stripe handles all payout compliance — if Stripe supports it, we can pay there
const ALLOWED_INSTRUCTOR_COUNTRIES = new Set([
  'United States', 'Canada', 'Mexico',
  'United Kingdom', 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus',
  'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
  'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
  'Australia', 'New Zealand',
  'India', 'Japan', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Hong Kong',
  'South Korea', 'Philippines',
  'United Arab Emirates',
  'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru',
  'South Africa', 'Kenya', 'Ghana', 'Nigeria',
  'Jamaica', 'Trinidad and Tobago', 'Dominican Republic', 'Bahamas',
])

export async function POST(req: Request) {
  try {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { role, firstName: bodyFirstName, lastName: bodyLastName, timezone, country, qualifications, aboutMe, certificatesUrl, subjects, age, gender, fathersName, mothersName } = body

  if (!role || !timezone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!country) {
    return NextResponse.json({ error: 'Please select your country.' }, { status: 400 })
  }

  if (role === 'instructor' && !ALLOWED_INSTRUCTOR_COUNTRIES.has(country)) {
    return NextResponse.json({
      error: 'Instructors must be based in the United States to receive payouts via Stripe.',
    }, { status: 400 })
  }

  if (role === 'student' && !ALLOWED_STUDENT_COUNTRIES.has(country)) {
    return NextResponse.json({
      error: 'SciQuest Learning is not yet available in your country.',
    }, { status: 400 })
  }

  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(userId)

  const firstName = bodyFirstName || clerkUser.firstName || ''
  const lastName = bodyLastName || clerkUser.lastName || ''
  const email = clerkUser.emailAddresses[0]?.emailAddress || ''

  const dbRole = role === 'instructor' ? 'INSTRUCTOR' : 'STUDENT'

  const studentFields =
    dbRole === 'STUDENT'
      ? {
          age: age ? parseInt(age) : null,
          gender: gender || null,
          fathersName: fathersName || null,
          mothersName: mothersName || null,
        }
      : {}

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ clerkId: userId }, { email }] },
  })

  const instructorFields = dbRole === 'INSTRUCTOR' ? { instructorStatus: 'PENDING_REVIEW' as const } : {}

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        clerkId: userId,
        firstName,
        lastName,
        role: dbRole,
        timezone,
        country,
        qualifications: qualifications || null,
        aboutMe: aboutMe || null,
        certificatesUrl: certificatesUrl || null,
        subjects: subjects || [],
        ...studentFields,
        ...instructorFields,
      },
    })
  } else {
    await prisma.user.create({
      data: {
        clerkId: userId,
        role: dbRole,
        firstName,
        lastName,
        email,
        timezone,
        country,
        qualifications: qualifications || null,
        aboutMe: aboutMe || null,
        certificatesUrl: certificatesUrl || null,
        subjects: subjects || [],
        ...studentFields,
        ...instructorFields,
      },
    })
  }

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  })

  return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[onboarding] unexpected error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
