import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// Dispatches signed-in users to the correct dashboard based on their role.
// All Clerk sign-in flows point here via forceRedirectUrl.
export default async function AuthRedirectPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const role = user.publicMetadata?.role as string | undefined

  if (role === 'admin') redirect('/admin')
  if (role === 'instructor') redirect('/instructor')
  if (role === 'student') redirect('/student')

  // No role yet — send to onboarding
  redirect('/onboarding')
}
