import { NextRequest } from 'next/server'
import type { ApiKey, Source } from '@prisma/client'
import { authenticateRequest, checkModelPermission } from '@/lib/gateway/auth'
import { lazyResetQuota, checkQuota, deductQuota } from '@/lib/gateway/quota'
import { checkRpm } from '@/lib/gateway/rate-limit'
import { selectSource } from '@/lib/gateway/router'
import { forwardNonStream, forwardStream } from '@/lib/gateway/upstream'
import { calculateCost } from '@/lib/gateway/pricing'
import { writeLog } from '@/lib/gateway/logger'

function errorResponse(error: string, status: number) {
  return Response.json(
    { error: { message: error, type: 'error', code: status } },
    { status },
  )
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // 1. 认证
  const auth = await authenticateRequest(request.headers.get('Authorization'))
  if (!auth.success || !auth.apiKey) {
    return errorResponse(auth.error!, auth.statusCode ?? 401)
  }
  const apiKey = auth.apiKey

  // 2. 解析请求体
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const modelId = body.model as string
  if (!modelId) {
    return errorResponse('Missing required field: model', 400)
  }

  const isStream = body.stream === true

  // 3. 模型权限检查
  if (!checkModelPermission(apiKey, modelId)) {
    return errorResponse(`Model "${modelId}" is not allowed for this API key`, 403)
  }

  // 4. 懒刷新额度
  const refreshedKey = await lazyResetQuota(apiKey)

  // 5. 额度预检
  const quotaCheck = checkQuota(refreshedKey)
  if (!quotaCheck.success) {
    return errorResponse(quotaCheck.error!, quotaCheck.statusCode ?? 429)
  }

  // 6. RPM 速率限制
  const rpmCheck = checkRpm(apiKey.id, apiKey.rpm)
  if (!rpmCheck.success) {
    return errorResponse(rpmCheck.error!, rpmCheck.statusCode ?? 429)
  }

  // 7. 选择上游源
  const source = await selectSource(modelId)
  if (!source) {
    return errorResponse(`No available upstream source for model "${modelId}"`, 503)
  }

  // 8. 转发请求
  try {
    if (isStream) {
      return await handleStream(apiKey, source, body, modelId, startTime)
    } else {
      return await handleNonStream(apiKey, source, body, modelId, startTime)
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal gateway error'
    writeLog({
      apiKeyId: apiKey.id,
      keyName: apiKey.name,
      modelId,
      sourceId: source.id,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      cost: 0,
      latencyMs: Date.now() - startTime,
      statusCode: 500,
      isStream,
      errorMsg: msg,
    })
    return errorResponse(msg, 500)
  }
}

async function handleNonStream(
  apiKey: ApiKey,
  source: Source,
  body: Record<string, unknown>,
  modelId: string,
  startTime: number,
) {
  const result = await forwardNonStream(source, body)

  // 计算费用并异步扣减
  const cost = await calculateCost(modelId, result.usage)
  if (cost > 0) deductQuota(apiKey.id, cost)

  // 写日志
  writeLog({
    apiKeyId: apiKey.id,
    keyName: apiKey.name,
    modelId,
    sourceId: source.id,
    usage: result.usage,
    cost,
    latencyMs: result.latencyMs,
    statusCode: result.statusCode,
    isStream: false,
    errorMsg: result.errorMsg,
  })

  return result.response
}

async function handleStream(
  apiKey: ApiKey,
  source: Source,
  body: Record<string, unknown>,
  modelId: string,
  startTime: number,
) {
  const result = await forwardStream(source, body)

  if (result.errorMsg) {
    writeLog({
      apiKeyId: apiKey.id,
      keyName: apiKey.name,
      modelId,
      sourceId: source.id,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      cost: 0,
      latencyMs: result.latencyMs,
      statusCode: result.statusCode,
      isStream: true,
      errorMsg: result.errorMsg,
    })
    return result.response
  }

  // 异步等待 usage，完成后扣费 + 写日志
  result.usagePromise.then(async (usage) => {
    const cost = await calculateCost(modelId, usage)
    if (cost > 0) deductQuota(apiKey.id, cost)
    writeLog({
      apiKeyId: apiKey.id,
      keyName: apiKey.name,
      modelId,
      sourceId: source.id,
      usage,
      cost,
      latencyMs: Date.now() - startTime,
      statusCode: result.statusCode,
      isStream: true,
    })
  })

  return result.response
}
