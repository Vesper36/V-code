import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '20')
  const skip = (page - 1) * perPage

  const [items, total] = await Promise.all([
    prisma.source.findMany({ skip, take: perPage, orderBy: { priority: 'desc' } }),
    prisma.source.count(),
  ])

  return NextResponse.json({ items, total, page, perPage })
}

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, baseUrl, apiKey, models, priority, weight, status } = body

    if (!name || !baseUrl || !apiKey) {
      return NextResponse.json({ error: 'name, baseUrl, apiKey are required' }, { status: 400 })
    }

    const source = await prisma.source.create({
      data: {
        name,
        baseUrl,
        apiKey,
        models: models || [],
        priority: priority ?? 0,
        weight: weight ?? 1,
        status: status ?? 1,
      },
    })

    return NextResponse.json(source, { status: 201 })
  } catch (error) {
    console.error('Failed to create source:', error)
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 })
  }
}
