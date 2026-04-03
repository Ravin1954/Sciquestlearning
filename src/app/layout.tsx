import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://sciquestlearning.com'),
  title: {
    default: 'SciQuest Learning — Live Science & Math Classes for Middle & High School',
    template: '%s | SciQuest Learning',
  },
  description: 'Connect with verified science educators for live, interactive Google Meet classes. Biology, Chemistry, Physical Science, and Mathematics for grades 8–12. Enroll today.',
  keywords: [
    'online science classes', 'online math classes', 'middle school science tutor',
    'high school biology tutor', 'online chemistry class', 'physical science tutor',
    'live online tutoring', 'grades 8 9 10 11 12 science', 'biology 9th grade',
    'chemistry 10th grade', 'Google Meet tutoring', 'SciQuest Learning',
  ],
  authors: [{ name: 'SciQuest Learning', url: 'https://sciquestlearning.com' }],
  creator: 'SciQuest Learning',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sciquestlearning.com',
    siteName: 'SciQuest Learning',
    title: 'SciQuest Learning — Live Science & Math Classes for Grades 8–12',
    description: 'Live, interactive Google Meet science and math classes taught by verified educators. Biology, Chemistry, Physical Science, Mathematics — tailored for middle and high school students.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SciQuest Learning — Live Science & Math Classes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SciQuest Learning — Live Science & Math Classes',
    description: 'Live Google Meet science and math classes for grades 8–12. Biology, Chemistry, Physical Science, Mathematics.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://sciquestlearning.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body style={{ backgroundColor: '#0B1A2E', color: '#e8edf5', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
