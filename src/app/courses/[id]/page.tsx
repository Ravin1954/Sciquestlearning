import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import CoursePageClient from './CoursePageClient'

const subjectLabels: Record<string, string> = {
  BIOLOGY: 'Biology',
  PHYSICAL_SCIENCE: 'Physical Science',
  CHEMISTRY: 'Chemistry',
  MATHEMATICS: 'Mathematics',
}

async function getCourse(id: string) {
  try {
    return await prisma.course.findUnique({
      where: { id },
      include: { instructor: { select: { firstName: true, lastName: true } } },
    })
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) {
    return { title: 'Course Not Found' }
  }

  const subject = subjectLabels[course.subject] || course.subject
  const instructor = `${course.instructor.firstName} ${course.instructor.lastName}`
  const title = `${course.title} — ${subject} with ${instructor}`
  const description = course.description.slice(0, 160)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://sciquestlearning.com/courses/${id}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://sciquestlearning.com/courses/${id}`,
    },
  }
}

export default async function CourseDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const course = await getCourse(id)

  const jsonLd = course ? {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'SciQuest Learning',
      url: 'https://sciquestlearning.com',
    },
    instructor: {
      '@type': 'Person',
      name: `${course.instructor.firstName} ${course.instructor.lastName}`,
    },
    offers: {
      '@type': 'Offer',
      price: Number(course.feeUsd).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://sciquestlearning.com/courses/${id}`,
    },
    educationalLevel: 'Middle School, High School',
    inLanguage: 'en',
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CoursePageClient />
    </>
  )
}
