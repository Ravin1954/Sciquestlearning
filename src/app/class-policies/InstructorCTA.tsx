'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export default function InstructorCTA() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role as string | undefined
  if (role !== 'instructor' && role !== 'admin') return null

  return (
    <div style={{ backgroundColor: '#0f2240', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
      <p style={{ color: '#a8c4e0', marginBottom: '1rem', fontSize: '0.9rem' }}>
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
