import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const CARIBBEAN = [
  'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Cuba', 'Dominica',
  'Dominican Republic', 'Grenada', 'Haiti', 'Jamaica', 'Puerto Rico',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Trinidad and Tobago',
]

const EUROPE = [
  'Albania', 'Andorra', 'Austria', 'Belgium', 'Bosnia and Herzegovina',
  'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia',
  'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland',
  'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia',
  'Norway', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Serbia', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom',
]

const ALLOWED_STUDENT_COUNTRIES = new Set([
  'United States', 'Canada', 'Mexico', 'China', 'Philippines', 'South Korea',
  ...CARIBBEAN,
  ...EUROPE,
])

const ALLOWED_INSTRUCTOR_COUNTRIES = new Set(['United States'])

export async function POST(req: Request) {
  try {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { role, timezone, country, qualifications, subjects, age, gender, fathersName, mothersName } = body

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

  const firstName = clerkUser.firstName || ''
  const lastName = clerkUser.lastName || ''
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

  await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      role: dbRole,
      timezone,
      country,
      qualifications: qualifications || null,
      subjects: subjects || [],
      ...studentFields,
    },
    create: {
      clerkId: userId,
      role: dbRole,
      firstName,
      lastName,
      email,
      timezone,
      country,
      qualifications: qualifications || null,
      subjects: subjects || [],
      ...studentFields,
    },
  })

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
