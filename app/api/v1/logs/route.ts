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
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') ?? '20')))

  const [items, total] = await Promise.all([
    prisma.requestLog.findMany({
      where: { apiKeyId: auth.apiKey.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        modelId: true,
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        cost: true,
        latencyMs: true,
        statusCode: true,
        isStream: true,
        createdAt: true,
      },
    }),
    prisma.requestLog.count({ where: { apiKeyId: auth.apiKey.id } }),
  ])

  return Response.json({
    data: items.map(l => ({
      id: l.id,
      model_name: l.modelId,
      tokens: l.totalTokens,
      prompt_tokens: l.promptTokens,
      completion_tokens: l.completionTokens,
      cost: Number(l.cost),
      latency_ms: l.latencyMs,
      status_code: l.statusCode,
      is_stream: l.isStream,
      created_at: l.createdAt.toISOString(),
    })),
    total,
    page,
    per_page: perPage,
  })
}
