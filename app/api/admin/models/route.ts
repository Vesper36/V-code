import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '50')
  const skip = (page - 1) * perPage

  const [items, total] = await Promise.all([
    prisma.modelConfig.findMany({ skip, take: perPage, orderBy: { modelId: 'asc' } }),
    prisma.modelConfig.count(),
  ])

  return NextResponse.json({ items, total, page, perPage })
}

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { modelId, displayName, inputPrice, outputPrice, rpm, tpm, status } = body

    if (!modelId || !displayName) {
      return NextResponse.json({ error: 'modelId, displayName are required' }, { status: 400 })
    }

    const model = await prisma.modelConfig.create({
      data: {
        modelId,
        displayName,
        inputPrice: inputPrice ?? 0,
        outputPrice: outputPrice ?? 0,
        rpm: rpm ?? 60,
        tpm: tpm ?? 100000,
        status: status ?? 1,
      },
    })

    return NextResponse.json(model, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Model ID already exists' }, { status: 409 })
    }
    console.error('Failed to create model:', error)
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 })
  }
}
