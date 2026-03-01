import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, unauthorizedResponse } from '@/lib/api/docs-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join, resolve } from 'path'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    }

    const ext = mimeToExt[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: jpg, png, gif, webp' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const filename = `${randomBytes(16).toString('hex')}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'docs')

    await mkdir(uploadDir, { recursive: true })

    const finalPath = resolve(uploadDir, filename)
    if (!finalPath.startsWith(resolve(uploadDir))) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    await writeFile(finalPath, Buffer.from(bytes))

    const url = `/uploads/docs/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
