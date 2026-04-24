import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'sciquest-courses', resource_type: 'image', transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error || !result) reject(error)
        else resolve(result as { secure_url: string })
      }
    ).end(buffer)
  })

  return NextResponse.json({ url: result.secure_url })
}
