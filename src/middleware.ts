import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

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
  '/qrcode',
  '/api/qrcode',
  '/flyer',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
