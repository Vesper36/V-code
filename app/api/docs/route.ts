import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, unauthorizedResponse } from '@/lib/api/docs-auth'
import { getDocuments, createDocument, getDocumentBySlug, incrementViewCount } from '@/lib/db/docs'
import { DocStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Single doc by slug
  const slug = searchParams.get('slug')
  if (slug) {
    try {
      const doc = await getDocumentBySlug(slug)
      if (!doc) {
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
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '20')
  const status = searchParams.get('status') as DocStatus | null
  const categoryId = searchParams.get('categoryId')
  const search = searchParams.get('search') || undefined

  try {
    const result = await getDocuments({
      page,
      perPage,
      status: status || undefined,
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
