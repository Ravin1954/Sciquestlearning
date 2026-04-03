import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/courses', '/courses/'],
        disallow: ['/admin', '/instructor', '/student', '/api/', '/onboarding'],
      },
    ],
    sitemap: 'https://sciquestlearning.com/sitemap.xml',
  }
}
