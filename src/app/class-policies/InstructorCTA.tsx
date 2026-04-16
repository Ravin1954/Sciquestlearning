'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export default function InstructorCTA() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role as string | undefined
  if (role !== 'instructor' && role !== 'admin') return null

  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #C5D5E4', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
      <p style={{ color: '#2d4a6b', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Ready to submit a course? Make sure your listing follows all the requirements above.
      </p>
      <Link
        href="/instructor/courses/new"
        style={{ backgroundColor: '#00C2A8', color: '#0B1A2E', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block' }}
      >
        Create a Course →
      </Link>
    </div>
  )
}
