import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const role = user?.publicMetadata?.role as string | undefined

  if (role === 'admin') redirect('/admin')
  if (role === 'instructor') redirect('/instructor')
  if (role === 'student') redirect('/student')

  // Not onboarded yet
  redirect('/onboarding')
}
