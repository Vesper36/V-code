import { prisma } from '@/lib/db/prisma'
import type { ApiKey } from '@prisma/client'

export interface QuotaCheckResult {
  success: boolean
  error?: string
  statusCode?: number
}

/**
 * 懒刷新日/月额度：检查 resetAt 是否过期，过期则重置 used 并更新 resetAt
 */
export async function lazyResetQuota(apiKey: ApiKey): Promise<ApiKey> {
  const now = new Date()
  const updates: Record<string, unknown> = {}

  // 日额度刷新
  if (apiKey.dailyQuota !== null) {
    if (!apiKey.dailyResetAt || now >= new Date(apiKey.dailyResetAt)) {
      const tomorrow = new Date(now)
      tomorrow.setUTCHours(0, 0, 0, 0)
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      updates.dailyUsed = 0
      updates.dailyResetAt = tomorrow
    }
  }

  // 月额度刷新
  if (apiKey.monthlyQuota !== null) {
    if (!apiKey.monthlyResetAt || now >= new Date(apiKey.monthlyResetAt)) {
      const nextMonth = new Date(now)
      nextMonth.setUTCHours(0, 0, 0, 0)
      nextMonth.setUTCDate(1)
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1)
      updates.monthlyUsed = 0
      updates.monthlyResetAt = nextMonth
    }
  }

  if (Object.keys(updates).length > 0) {
    return prisma.apiKey.update({
      where: { id: apiKey.id },
      data: updates,
    })
  }

  return apiKey
}

/**
 * 额度预检：检查总额度、日额度、月额度是否足够
 */
export function checkQuota(apiKey: ApiKey): QuotaCheckResult {
  const totalQuota = Number(apiKey.totalQuota)
  const usedQuota = Number(apiKey.usedQuota)

  // 总额度检查（totalQuota > 0 才限制）
  if (totalQuota > 0 && usedQuota >= totalQuota) {
    return { success: false, error: 'Total quota exceeded', statusCode: 429 }
  }

  // 日额度检查
  if (apiKey.dailyQuota !== null) {
    const dailyQuota = Number(apiKey.dailyQuota)
    const dailyUsed = Number(apiKey.dailyUsed)
    if (dailyQuota > 0 && dailyUsed >= dailyQuota) {
      return { success: false, error: 'Daily quota exceeded', statusCode: 429 }
    }
  }

  // 月额度检查
  if (apiKey.monthlyQuota !== null) {
    const monthlyQuota = Number(apiKey.monthlyQuota)
    const monthlyUsed = Number(apiKey.monthlyUsed)
    if (monthlyQuota > 0 && monthlyUsed >= monthlyQuota) {
      return { success: false, error: 'Monthly quota exceeded', statusCode: 429 }
    }
  }

  return { success: true }
}

/**
 * 扣减额度：更新 usedQuota / dailyUsed / monthlyUsed + lastUsedAt
 */
export async function deductQuota(apiKeyId: number, cost: number): Promise<void> {
  await prisma.apiKey.update({
    where: { id: apiKeyId },
    data: {
      usedQuota: { increment: cost },
      dailyUsed: { increment: cost },
      monthlyUsed: { increment: cost },
      lastUsedAt: new Date(),
    },
  })
}
