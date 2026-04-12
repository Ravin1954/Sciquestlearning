import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://sciquestlearning.com'),
  title: {
    default: 'SciQuest Learning — Live Science & Math Classes for Middle & High School',
    template: '%s | SciQuest Learning',
  },
  description: 'SciQuest Learning offers live, interactive online science and math classes for middle and high school students (grades 6–12). Biology, Chemistry, Physical Science, and Mathematics taught by verified educators via Google Meet. Enroll today.',
  keywords: [
    'online science tutor', 'online math tutor', 'live online science classes',
    'middle school science tutor', 'high school science tutor',
    'online biology class', 'online chemistry class', 'online physics class',
    'online math class', 'physical science tutor', 'live tutoring Google Meet',
    'grades 6 7 8 9 10 11 12 science', 'biology tutor online',
    'chemistry tutor online', 'mathematics tutor online',
    'interactive online classes for teens', 'STEM tutoring online',
    'science classes for high school students', 'affordable online tutoring',
    'SciQuest Learning', 'sciquestlearning.com',
  ],
  authors: [{ name: 'SciQuest Learning', url: 'https://sciquestlearning.com' }],
  creator: 'SciQuest Learning',
  publisher: 'SciQuest Learning',
  category: 'Education',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sciquestlearning.com',
    siteName: 'SciQuest Learning',
    title: 'SciQuest Learning — Live Science & Math Classes for Grades 6–12',
    description: 'Live, interactive online science and math classes for middle and high school students. Biology, Chemistry, Physical Science, Mathematics — taught by verified educators via Google Meet.',
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
    title: 'SciQuest Learning — Live Science & Math Classes for Grades 6–12',
    description: 'Live Google Meet science and math classes for middle and high school students. Biology, Chemistry, Physical Science, Mathematics.',
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
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
