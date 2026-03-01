import { prisma } from '@/lib/db/prisma'
import type { TokenUsage } from './token-counter'

/**
 * 根据模型配置计算请求费用（美元）
 * 价格单位：$/1M tokens
 */
export async function calculateCost(modelId: string, usage: TokenUsage): Promise<number> {
  const config = await prisma.modelConfig.findUnique({
    where: { modelId },
  })

  if (!config) return 0

  const inputCost = (usage.promptTokens / 1_000_000) * Number(config.inputPrice)
  const outputCost = (usage.completionTokens / 1_000_000) * Number(config.outputPrice)

  return inputCost + outputCost
}
