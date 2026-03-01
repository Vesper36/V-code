import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'overview'

  if (type === 'trend') return handleTrend(searchParams)
  if (type === 'models') return handleModelDistribution()
  if (type === 'keys') return handleKeyUsage()
  return handleOverview()
}

async function handleOverview() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [totalKeys, activeKeys, totalSources, todayLogs] = await Promise.all([
    prisma.apiKey.count(),
    prisma.apiKey.count({ where: { status: 1 } }),
    prisma.source.count({ where: { status: 1 } }),
    prisma.requestLog.findMany({
      where: { createdAt: { gte: todayStart } },
      select: { cost: true, totalTokens: true },
    }),
  ])

  let todayCost = 0
  let todayTokens = 0
  for (const log of todayLogs) {
    todayCost += Number(log.cost)
    todayTokens += log.totalTokens
  }

  return NextResponse.json({
    totalKeys,
    activeKeys,
    totalSources,
    todayRequests: todayLogs.length,
    todayCost,
    todayTokens,
  })
}

async function handleTrend(params: URLSearchParams) {
  const days = parseInt(params.get('days') || '7')
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const logs = await prisma.requestLog.findMany({
    where: { createdAt: { gte: startDate } },
    select: { cost: true, totalTokens: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const dayMap = new Map<string, { requests: number; cost: number; tokens: number }>()
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    dayMap.set(d.toISOString().slice(0, 10), { requests: 0, cost: 0, tokens: 0 })
  }

  for (const log of logs) {
    const day = new Date(log.createdAt).toISOString().slice(0, 10)
    const entry = dayMap.get(day)
    if (entry) {
      entry.requests++
      entry.cost += Number(log.cost)
      entry.tokens += log.totalTokens
    }
  }

  const trend = Array.from(dayMap.entries()).map(([date, data]) => ({
    date,
    requests: data.requests,
    cost: data.cost,
    tokens: data.tokens,
  }))

  return NextResponse.json(trend)
}

async function handleModelDistribution() {
  const logs = await prisma.requestLog.findMany({
    select: { modelId: true, cost: true, totalTokens: true },
  })

  const modelMap = new Map<string, { requests: number; cost: number; tokens: number }>()
  for (const log of logs) {
    const entry = modelMap.get(log.modelId) || { requests: 0, cost: 0, tokens: 0 }
    entry.requests++
    entry.cost += Number(log.cost)
    entry.tokens += log.totalTokens
    modelMap.set(log.modelId, entry)
  }

  const result = Array.from(modelMap.entries())
    .map(([model, data]) => ({ model, ...data }))
    .sort((a, b) => b.requests - a.requests)

  return NextResponse.json(result)
}

async function handleKeyUsage() {
  const logs = await prisma.requestLog.findMany({
    select: { keyName: true, cost: true, totalTokens: true },
  })

  const keyMap = new Map<string, { requests: number; cost: number; tokens: number }>()
  for (const log of logs) {
    const entry = keyMap.get(log.keyName) || { requests: 0, cost: 0, tokens: 0 }
    entry.requests++
    entry.cost += Number(log.cost)
    entry.tokens += log.totalTokens
    keyMap.set(log.keyName, entry)
  }

  const result = Array.from(keyMap.entries())
    .map(([keyName, data]) => ({ keyName, ...data }))
    .sort((a, b) => b.requests - a.requests)

  return NextResponse.json(result)
}
