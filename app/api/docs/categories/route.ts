import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, unauthorizedResponse } from '@/lib/api/docs-auth'
import { getCategoryTree, createCategory } from '@/lib/db/categories'

export async function GET() {
  try {
    const tree = await getCategoryTree()
    return NextResponse.json(tree)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { name, slug, description, parentId, icon, sortOrder, isVisible } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
    }

    const category = await createCategory({
      name, slug, description, parentId, icon, sortOrder, isVisible,
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
