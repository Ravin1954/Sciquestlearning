import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SciQuest Learning',
    short_name: 'SciQuest',
    description: 'Live science and math tutoring for middle & high school students',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B1A2E',
    theme_color: '#00C2A8',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
