import { prisma } from '@/lib/db/prisma'
import type { Source } from '@prisma/client'

/**
 * 上游源选择：priority 降序 -> 最高优先级组内 weight 加权随机
 */
export async function selectSource(modelId: string): Promise<Source | null> {
  const sources = await prisma.source.findMany({
    where: { status: 1 },
    orderBy: { priority: 'desc' },
  })

  // 过滤支持该模型的源
  const candidates = sources.filter(s => {
    const models = s.models as string[]
    if (!models || models.length === 0) return true // 空数组表示支持所有模型
    return models.includes(modelId)
  })

  if (candidates.length === 0) return null

  // 取最高优先级
  const maxPriority = candidates[0].priority
  const topGroup = candidates.filter(s => s.priority === maxPriority)

  // 加权随机选择
  return weightedRandom(topGroup)
}

function weightedRandom(sources: Source[]): Source {
  if (sources.length === 1) return sources[0]

  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0)
  let rand = Math.random() * totalWeight

  for (const source of sources) {
    rand -= source.weight
    if (rand <= 0) return source
  }

  return sources[sources.length - 1]
}
