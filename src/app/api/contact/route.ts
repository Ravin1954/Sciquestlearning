import { NextResponse } from 'next/server'
import { sendContactFormEmail } from '@/lib/resend'

export async function POST(req: Request) {
  const { name, email, role, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 })
  }

  try {
    await sendContactFormEmail(name, email, role || 'Not specified', message)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact form]', err)
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
  }
}
