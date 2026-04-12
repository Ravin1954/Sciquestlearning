import QRCode from 'qrcode'
import { NextResponse } from 'next/server'

export async function GET() {
  const svg = await QRCode.toString('https://sciquestlearning.com', {
    type: 'svg',
    color: { dark: '#0B1A2E', light: '#ffffff' },
    margin: 2,
    width: 300,
  })
  return new NextResponse(svg, {
    headers: { 'Content-Type': 'image/svg+xml' },
  })
}
