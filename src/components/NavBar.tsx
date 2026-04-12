'use client'

import Link from 'next/link'
import { useAuth, useUser } from '@clerk/nextjs'
import { UserButton, SignInButton } from '@clerk/nextjs'

export default function NavBar() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const role = user?.publicMetadata?.role as string | undefined
  const isInstructor = role === 'instructor' || role === 'admin'

  return (
    <nav
      style={{ backgroundColor: '#0f2240', borderBottom: '1px solid #1e3a5f' }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="SciQuest Learning" style={{ height: '36px', width: 'auto' }} />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/courses"
              style={{ color: '#a8c4e0' }}
              className="hover:text-white transition-colors text-sm font-medium"
            >
              Browse Courses
            </Link>
            {(!isSignedIn || isInstructor) && (
              <Link
                href="/class-policies"
                style={{ color: '#a8c4e0' }}
                className="hover:text-white transition-colors text-sm font-medium"
              >
                Class Policies
              </Link>
            )}
            <Link
              href="/contact"
              style={{ color: '#a8c4e0' }}
              className="hover:text-white transition-colors text-sm font-medium"
            >
              Contact Us
            </Link>
            {isSignedIn && (
              <Link
                href="/auth/redirect"
                style={{ color: '#a8c4e0' }}
                className="hover:text-white transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal" forceRedirectUrl="/auth/redirect">
                <button
                  style={{ color: '#00C2A8', border: '1px solid #00C2A8' }}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-900 transition-colors"
                >
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
