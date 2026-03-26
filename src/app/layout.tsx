import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'SciQuest Learning - Live Science & Math Classes',
  description: 'Connect with verified science educators for live Zoom-based classes. Biology, Chemistry, Physical Science, and Mathematics for Middle and High School students.',
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
