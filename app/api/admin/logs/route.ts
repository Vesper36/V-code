import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '20')
  const keyId = searchParams.get('keyId')
  const modelId = searchParams.get('modelId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const skip = (page - 1) * perPage

  const where: Prisma.RequestLogWhereInput = {}
  if (keyId) where.apiKeyId = parseInt(keyId)
  if (modelId) where.modelId = modelId
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }

  const [items, total] = await Promise.all([
    prisma.requestLog.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.requestLog.count({ where }),
  ])

  return NextResponse.json({ items, total, page, perPage })
}
