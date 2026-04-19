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
      style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #C5D5E4', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="SciQuest Learning" style={{ height: '48px', width: 'auto' }} />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/#about"
              style={{ color: '#2d4a6b' }}
              className="hover:text-gray-900 transition-colors text-sm font-medium"
            >
              About Us
            </Link>
            <Link
              href="/courses"
              style={{ color: '#2d4a6b' }}
              className="hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Browse Courses
            </Link>
            {(!isSignedIn || isInstructor) && (
              <Link
                href="/class-policies"
                style={{ color: '#2d4a6b' }}
                className="hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Class Policies
              </Link>
            )}
            {isSignedIn && !isInstructor && (
              <Link
                href="/student-policies"
                style={{ color: '#2d4a6b' }}
                className="hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Student Policies
              </Link>
            )}
            <Link
              href="/contact"
              style={{ color: '#2d4a6b' }}
              className="hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Contact Us
            </Link>
            {isSignedIn && (
              <Link
                href="/auth/redirect"
                style={{ color: '#2d4a6b' }}
                className="hover:text-gray-900 transition-colors text-sm font-medium"
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
                  style={{ color: '#00A896', border: '1px solid #00A896', backgroundColor: 'transparent' }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
