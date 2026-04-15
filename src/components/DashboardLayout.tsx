'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { ReactNode } from 'react'

interface NavItem {
  label: string
  href: string
  icon: string
}

interface DashboardLayoutProps {
  children: ReactNode
  role: 'admin' | 'instructor' | 'student'
}

const navItems: Record<string, NavItem[]> = {
  admin: [
    { label: 'Overview', href: '/admin', icon: '📊' },
    { label: 'Courses', href: '/admin/courses', icon: '📚' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
    { label: 'Payouts', href: '/admin/payouts', icon: '💸' },
  ],
  instructor: [
    { label: 'Dashboard', href: '/instructor', icon: '📊' },
    { label: 'My Courses', href: '/instructor/courses', icon: '📚' },
    { label: 'New Course', href: '/instructor/courses/new', icon: '➕' },
    { label: 'Earnings', href: '/instructor/earnings', icon: '💰' },
    { label: 'My Profile', href: '/instructor/profile', icon: '👤' },
  ],
  student: [
    { label: 'Dashboard', href: '/student', icon: '📊' },
    { label: 'Browse Courses', href: '/courses', icon: '🔍' },
    { label: 'My Enrollments', href: '/student/enrollments', icon: '📚' },
    { label: 'My Profile', href: '/student/profile', icon: '👤' },
  ],
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const items = navItems[role] || []

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B1A2E' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          backgroundColor: '#0f2240',
          borderRight: '1px solid #1e3a5f',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
        }}
      >
        <Link href="/" style={{ marginBottom: '1.5rem', display: 'block' }}>
          <span style={{ fontFamily: 'Fraunces, serif', color: '#00C2A8', fontSize: '1.25rem', fontWeight: 700 }}>
            SciQuest
          </span>
          <span style={{ fontFamily: 'Fraunces, serif', color: '#F5C842', fontSize: '1.25rem' }}>
            {' '}Learning
          </span>
        </Link>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: '#6b88a8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }}>
            {role.charAt(0).toUpperCase() + role.slice(1)} Portal
          </p>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#00C2A8' : '#a8c4e0',
                  backgroundColor: isActive ? '#003d35' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserButton />
          <span style={{ color: '#6b88a8', fontSize: '0.8rem' }}>Account</span>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: '240px', padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
