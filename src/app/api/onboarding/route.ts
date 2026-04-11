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

// Instructor countries: all countries where PayPal can receive payments
// Instructors can use Stripe Connect (bank transfer) or PayPal for payouts
// Only OFAC-sanctioned countries excluded (Cuba, Iran, North Korea, Syria, Sudan, Russia)
const ALLOWED_INSTRUCTOR_COUNTRIES = new Set([
  'United States', 'Canada', 'Mexico',
  'Albania', 'Andorra', 'Austria', 'Belgium', 'Bosnia and Herzegovina',
  'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia',
  'Finland', 'France', 'Germany', 'Gibraltar', 'Greece', 'Hungary', 'Iceland',
  'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands',
  'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'San Marino',
  'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
  'Ukraine', 'United Kingdom',
  'Australia', 'New Zealand', 'Japan', 'South Korea', 'Singapore', 'Hong Kong',
  'Taiwan', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam',
  'India', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Pakistan',
  'Cambodia', 'Mongolia',
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain',
  'Oman', 'Jordan', 'Israel', 'Turkey',
  'South Africa', 'Kenya', 'Ghana', 'Nigeria', 'Tanzania', 'Uganda',
  'Rwanda', 'Mozambique', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia',
  'Senegal', 'Ivory Coast', 'Cameroon',
  'Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Uruguay', 'Ecuador',
  'Paraguay', 'Bolivia', 'Venezuela', 'Guatemala', 'Costa Rica', 'Panama',
  'El Salvador', 'Honduras', 'Nicaragua',
  'Jamaica', 'Trinidad and Tobago', 'Dominican Republic', 'Bahamas',
  'Barbados', 'Belize',
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
