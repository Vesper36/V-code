/**
 * 从 OpenAI 兼容响应中提取 token usage
 */

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

const EMPTY_USAGE: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

/**
 * 从 non-stream JSON 响应提取 usage
 */
export function extractUsageFromResponse(body: Record<string, unknown>): TokenUsage {
  const usage = body.usage as Record<string, number> | undefined
  if (!usage) return EMPTY_USAGE

  return {
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
    totalTokens: usage.total_tokens ?? (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
  }
}

/**
 * 从 stream 的最后一个 data chunk 提取 usage
 * 需要在转发时注入 stream_options: { include_usage: true }
 */
export function extractUsageFromStreamChunk(line: string): TokenUsage | null {
  if (!line.startsWith('data: ')) return null
  const json = line.slice(6).trim()
  if (json === '[DONE]') return null

  try {
    const parsed = JSON.parse(json)
    if (parsed.usage) {
      return {
        promptTokens: parsed.usage.prompt_tokens ?? 0,
        completionTokens: parsed.usage.completion_tokens ?? 0,
        totalTokens: parsed.usage.total_tokens ?? 0,
      }
    }
  } catch {
    // 忽略解析错误
  }
  return null
}
