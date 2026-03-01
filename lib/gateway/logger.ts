import { prisma } from '@/lib/db/prisma'
import type { TokenUsage } from './token-counter'

export interface LogEntry {
  apiKeyId: number
  keyName: string
  modelId: string
  sourceId: number | null
  usage: TokenUsage
  cost: number
  latencyMs: number
  statusCode: number
  isStream: boolean
  errorMsg?: string | null
}

/**
 * 异步写入请求日志，不阻塞响应
 */
export function writeLog(entry: LogEntry): void {
  prisma.requestLog.create({
    data: {
      apiKeyId: entry.apiKeyId,
      keyName: entry.keyName,
      modelId: entry.modelId,
      sourceId: entry.sourceId,
      promptTokens: entry.usage.promptTokens,
      completionTokens: entry.usage.completionTokens,
      totalTokens: entry.usage.totalTokens,
      cost: entry.cost,
      latencyMs: entry.latencyMs,
      statusCode: entry.statusCode,
      isStream: entry.isStream,
      errorMsg: entry.errorMsg ?? null,
    },
  }).catch(err => {
    console.error('[gateway/logger] Failed to write log:', err)
  })
}
