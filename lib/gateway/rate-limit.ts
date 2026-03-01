/**
 * 速率限制：globalThis 内存滑动窗口计数器
 * Docker 重启清零可接受
 */

interface RateLimitEntry {
  timestamps: number[]
}

const WINDOW_MS = 60_000 // 60s 滑动窗口

const store = globalThis as unknown as {
  __rateLimitRpm?: Map<string, RateLimitEntry>
  __rateLimitTpm?: Map<string, RateLimitEntry>
}

function getRpmStore(): Map<string, RateLimitEntry> {
  if (!store.__rateLimitRpm) store.__rateLimitRpm = new Map()
  return store.__rateLimitRpm
}

function getTpmStore(): Map<string, RateLimitEntry> {
  if (!store.__rateLimitTpm) store.__rateLimitTpm = new Map()
  return store.__rateLimitTpm
}

function cleanExpired(entry: RateLimitEntry, now: number): void {
  const cutoff = now - WINDOW_MS
  while (entry.timestamps.length > 0 && entry.timestamps[0] < cutoff) {
    entry.timestamps.shift()
  }
}

export interface RateLimitResult {
  success: boolean
  error?: string
  statusCode?: number
}

/**
 * 检查并记录 RPM（每分钟请求数）
 */
export function checkRpm(keyId: number, limit: number): RateLimitResult {
  const now = Date.now()
  const key = `key:${keyId}`
  const rpmStore = getRpmStore()

  let entry = rpmStore.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    rpmStore.set(key, entry)
  }

  cleanExpired(entry, now)

  if (entry.timestamps.length >= limit) {
    return {
      success: false,
      error: `Rate limit exceeded: ${limit} requests per minute`,
      statusCode: 429,
    }
  }

  entry.timestamps.push(now)
  return { success: true }
}

/**
 * 检查 TPM（每分钟 token 数），预估检查
 * 实际 token 在响应后通过 recordTpm 补记
 */
export function checkTpm(keyId: number, limit: number, estimatedTokens: number): RateLimitResult {
  const now = Date.now()
  const key = `key:${keyId}`
  const tpmStore = getTpmStore()

  let entry = tpmStore.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    tpmStore.set(key, entry)
  }

  cleanExpired(entry, now)

  // timestamps 数组长度代表已消耗的 token 数（每个 token 一个时间戳太浪费，改用累计值）
  // 简化：用 entry 中的 count 字段
  const currentTokens = entry.timestamps.length
  if (currentTokens + estimatedTokens > limit) {
    return {
      success: false,
      error: `Token rate limit exceeded: ${limit} tokens per minute`,
      statusCode: 429,
    }
  }

  // 预占 estimatedTokens
  for (let i = 0; i < estimatedTokens; i++) {
    entry.timestamps.push(now)
  }

  return { success: true }
}

/**
 * 定期清理过期条目，防止内存泄漏
 * 每 5 分钟自动执行
 */
let cleanupTimer: ReturnType<typeof setInterval> | null = null

export function startCleanup(): void {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const store of [getRpmStore(), getTpmStore()]) {
      for (const [key, entry] of store) {
        cleanExpired(entry, now)
        if (entry.timestamps.length === 0) store.delete(key)
      }
    }
  }, 5 * 60_000)
}
