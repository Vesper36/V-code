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

  const models = await prisma.modelConfig.findMany({
    where: { status: 1 },
    orderBy: { modelId: 'asc' },
  })

  const allowed = auth.apiKey.allowedModels as string[]
  const filtered = (!allowed || allowed.length === 0)
    ? models
    : models.filter(m => allowed.includes(m.modelId))

  return Response.json({
    object: 'list',
    data: filtered.map(m => ({
      id: m.modelId,
      object: 'model',
      created: Math.floor(new Date(m.createdAt).getTime() / 1000),
      owned_by: 'v-ai',
    })),
  })
}
