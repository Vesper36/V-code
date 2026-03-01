import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/db/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const source = await prisma.source.findUnique({ where: { id: parseInt(id) } })
  if (!source) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 })
  }
  return NextResponse.json(source)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  try {
    const body = await request.json()
    const source = await prisma.source.update({
      where: { id: parseInt(id) },
      data: body,
    })
    return NextResponse.json(source)
  } catch (error) {
    console.error('Failed to update source:', error)
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  try {
    await prisma.source.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete source:', error)
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 })
  }
}
