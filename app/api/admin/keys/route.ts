import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/db/prisma'
import { randomBytes } from 'crypto'

function generateApiKey(): string {
  return 'sk-' + randomBytes(24).toString('base64url')
}

export async function GET(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '20')
  const skip = (page - 1) * perPage

  const [items, total] = await Promise.all([
    prisma.apiKey.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, key: true, status: true,
        allowedModels: true, totalQuota: true, usedQuota: true,
        dailyQuota: true, dailyUsed: true, dailyResetAt: true,
        monthlyQuota: true, monthlyUsed: true, monthlyResetAt: true,
        rpm: true, tpm: true, expiredAt: true, lastUsedAt: true,
        createdAt: true, updatedAt: true,
      },
    }),
    prisma.apiKey.count(),
  ])

  return NextResponse.json({ items, total, page, perPage })
}

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, allowedModels, totalQuota, dailyQuota, monthlyQuota, rpm, tpm, expiredAt } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const key = generateApiKey()
    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        allowedModels: allowedModels || [],
        totalQuota: totalQuota ?? 0,
        dailyQuota: dailyQuota ?? null,
        monthlyQuota: monthlyQuota ?? null,
        rpm: rpm ?? 60,
        tpm: tpm ?? 100000,
        expiredAt: expiredAt ? new Date(expiredAt) : null,
      },
    })

    return NextResponse.json(apiKey, { status: 201 })
  } catch (error) {
    console.error('Failed to create API key:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}
