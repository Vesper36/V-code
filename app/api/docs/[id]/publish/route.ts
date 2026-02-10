import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, unauthorizedResponse } from '@/lib/api/docs-auth'
import { publishDocument } from '@/lib/db/docs'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const { id } = await params
  const docId = parseInt(id)
  if (isNaN(docId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const doc = await publishDocument(docId)
    return NextResponse.json(doc)
  } catch (error) {
    console.error('Failed to publish document:', error)
    return NextResponse.json({ error: 'Failed to publish document' }, { status: 500 })
  }
}
