import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await prisma.course.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, createdAt: true },
  })

  const courseUrls = courses.map((course) => ({
    url: `https://sciquestlearning.com/courses/${course.id}`,
    lastModified: course.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://sciquestlearning.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://sciquestlearning.com/courses',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://sciquestlearning.com/sign-in',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://sciquestlearning.com/sign-up',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...courseUrls,
  ]
}
