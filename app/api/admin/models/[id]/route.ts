import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/db/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const model = await prisma.modelConfig.findUnique({ where: { id: parseInt(id) } })
  if (!model) {
    return NextResponse.json({ error: 'Model not found' }, { status: 404 })
  }
  return NextResponse.json(model)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  try {
    const body = await request.json()
    const model = await prisma.modelConfig.update({
      where: { id: parseInt(id) },
      data: body,
    })
    return NextResponse.json(model)
  } catch (error) {
    console.error('Failed to update model:', error)
    return NextResponse.json({ error: 'Failed to update model' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  try {
    await prisma.modelConfig.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete model:', error)
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 })
  }
}
