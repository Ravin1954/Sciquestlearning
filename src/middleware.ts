import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/courses(.*)',
  '/api/courses(.*)',
  '/api/contact(.*)',
  '/api/webhooks(.*)',
  '/api/cron(.*)',
  '/contact',
  '/class-policies',
  '/student-policies',
  '/instructor-policies',
  '/qrcode',
  '/api/qrcode',
  '/flyer',
])

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl

  if (process.env.MAINTENANCE_MODE === 'true' && url.pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', req.url))
  }

  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
