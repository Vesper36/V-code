import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/db/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const apiKey = await prisma.apiKey.findUnique({ where: { id: parseInt(id) } })
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key not found' }, { status: 404 })
  }
  return NextResponse.json(apiKey)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  try {
    const body = await request.json()
    if (body.expiredAt) body.expiredAt = new Date(body.expiredAt)
    const apiKey = await prisma.apiKey.update({
      where: { id: parseInt(id) },
      data: body,
    })
    return NextResponse.json(apiKey)
  } catch (error) {
    console.error('Failed to update API key:', error)
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  try {
    await prisma.apiKey.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
