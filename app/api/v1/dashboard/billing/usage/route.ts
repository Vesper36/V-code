import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { authenticateRequest } from '@/lib/gateway/auth'

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request.headers.get('Authorization'))
  if (!auth.success || !auth.apiKey) {
    return Response.json(
      { error: { message: auth.error, type: 'error' } },
      { status: auth.statusCode ?? 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start_date') || new Date().toISOString().slice(0, 10)
  const endDate = searchParams.get('end_date') || new Date().toISOString().slice(0, 10)

  const logs = await prisma.requestLog.findMany({
    where: {
      apiKeyId: auth.apiKey.id,
      createdAt: {
        gte: new Date(startDate + 'T00:00:00Z'),
        lte: new Date(endDate + 'T23:59:59Z'),
      },
    },
    select: { cost: true, totalTokens: true, createdAt: true },
  })

  const totalUsage = logs.reduce((sum, l) => sum + Number(l.cost), 0)

  // 按日聚合
  const dailyMap = new Map<string, number>()
  for (const log of logs) {
    const day = new Date(log.createdAt).toISOString().slice(0, 10)
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + Number(log.cost))
  }

  const dailyCosts = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, cost]) => ({
      timestamp: Math.floor(new Date(date).getTime() / 1000),
      line_items: [{ name: 'API Usage', cost }],
    }))

  return Response.json({
    object: 'billing_usage',
    total_usage: totalUsage * 100, // 转为 cents
    daily_costs: dailyCosts,
  })
}
