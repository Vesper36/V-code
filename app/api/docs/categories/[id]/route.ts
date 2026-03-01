import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, unauthorizedResponse } from '@/lib/api/docs-auth'
import { updateCategory, deleteCategory } from '@/lib/db/categories'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const { id } = await params
  const catId = parseInt(id)
  if (isNaN(catId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const category = await updateCategory(catId, body)
    return NextResponse.json(category)
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('Failed to update category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const { id } = await params
  const catId = parseInt(id)
  if (isNaN(catId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    await deleteCategory(catId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to delete category'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
