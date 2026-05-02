'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { ReactNode, useState, useEffect } from 'react'

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
    { label: 'My Enrollments', href: '/student', icon: '📚' },
    { label: 'My Profile', href: '/student/profile', icon: '👤' },
  ],
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const items = navItems[role] || []
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const sidebarContent = (
    <>
      <Link href="/" style={{ marginBottom: '1.5rem', display: 'block' }}>
        <span style={{ fontFamily: 'Fraunces, serif', color: '#00A896', fontSize: '1.25rem', fontWeight: 700 }}>SciQuest</span>
        <span style={{ fontFamily: 'Fraunces, serif', color: '#b8860b', fontSize: '1.25rem' }}> Learning</span>
      </Link>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#5a7a96', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }}>
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
                color: isActive ? '#00A896' : '#2d4a6b',
                backgroundColor: isActive ? '#E0F7F4' : 'transparent',
                textDecoration: 'none',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ borderTop: '1px solid #C5D5E4', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <UserButton />
        <span style={{ color: '#5a7a96', fontSize: '0.8rem' }}>Account</span>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#EEF3F8' }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #C5D5E4',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          position: 'fixed',
          top: 0,
          left: isMobile ? (sidebarOpen ? 0 : '-260px') : 0,
          height: '100vh',
          boxShadow: isMobile && sidebarOpen ? '4px 0 16px rgba(0,0,0,0.15)' : '1px 0 4px rgba(0,0,0,0.04)',
          zIndex: 50,
          transition: 'left 0.25s ease',
        }}
      >
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#5a7a96' }}
          >
            ✕
          </button>
        )}
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: isMobile ? 0 : '240px', minWidth: 0, overflowX: 'hidden' }}>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1rem',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #C5D5E4',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#0B1A2E', padding: '0.25rem' }}
            >
              ☰
            </button>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: 'Fraunces, serif', color: '#00A896', fontSize: '1.1rem', fontWeight: 700 }}>SciQuest</span>
              <span style={{ fontFamily: 'Fraunces, serif', color: '#b8860b', fontSize: '1.1rem' }}> Learning</span>
            </Link>
            <UserButton />
          </div>
        )}

        <div style={{ padding: isMobile ? '1.25rem 1rem' : '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
