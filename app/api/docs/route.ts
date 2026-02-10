import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, unauthorizedResponse } from '@/lib/api/docs-auth'
import { getDocuments, createDocument, getDocumentBySlug, incrementViewCount } from '@/lib/db/docs'
import { DocStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const isAdmin = verifyAdmin(request)

  // Single doc by slug
  const slug = searchParams.get('slug')
  if (slug) {
    try {
      const doc = await getDocumentBySlug(slug)
      if (!doc || (!isAdmin && doc.status !== 'published')) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      incrementViewCount(doc.id).catch(() => {})
      return NextResponse.json(doc)
    } catch (error) {
      console.error('Failed to fetch document by slug:', error)
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
    }
  }

  // List docs
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('perPage') || '20') || 20))
  const statusParam = searchParams.get('status') as DocStatus | null
  const categoryId = searchParams.get('categoryId')
  const search = searchParams.get('search') || undefined

  // Anonymous users can only see published documents
  const validStatuses: string[] = ['draft', 'published', 'archived']
  let status: DocStatus | undefined
  if (isAdmin && statusParam && validStatuses.includes(statusParam)) {
    status = statusParam as DocStatus
  } else if (!isAdmin) {
    status = 'published' as DocStatus
  }

  try {
    const result = await getDocuments({
      page,
      perPage,
      status,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { title, slug, content, excerpt, status, categoryId, isPinned, sortOrder } = body

    if (!title || !slug || content === undefined) {
      return NextResponse.json({ error: 'title, slug, content are required' }, { status: 400 })
    }

    const doc = await createDocument({
      title, slug, content, excerpt, status, categoryId, isPinned, sortOrder,
    })
    return NextResponse.json(doc, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('Failed to create document:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
