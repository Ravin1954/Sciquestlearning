import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const maxDuration = 30

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  console.log('[upload] cloud_name:', process.env.CLOUDINARY_CLOUD_NAME)
  console.log('[upload] api_key:', process.env.CLOUDINARY_API_KEY)
  console.log('[upload] api_secret set:', !!process.env.CLOUDINARY_API_SECRET)
  console.log('[upload] file size:', file.size, 'type:', file.type)

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'sciquest-courses', resource_type: 'image', transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => {
          if (error) {
            console.error('[upload] Cloudinary error:', error)
            reject(error)
          } else if (!result) {
            console.error('[upload] Cloudinary returned no result')
            reject(new Error('No result from Cloudinary'))
          } else {
            console.log('[upload] Success:', result.secure_url)
            resolve(result as { secure_url: string })
          }
        }
      )
      stream.end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (err) {
    console.error('[upload] Failed:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
