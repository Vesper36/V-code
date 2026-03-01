import type { Source } from '@prisma/client'
import { extractUsageFromResponse, extractUsageFromStreamChunk, type TokenUsage } from './token-counter'

export interface UpstreamResult {
  response: Response
  usage: TokenUsage
  latencyMs: number
  statusCode: number
  errorMsg?: string
}

/**
 * 非流式请求转发
 */
export async function forwardNonStream(
  source: Source,
  body: Record<string, unknown>,
): Promise<UpstreamResult> {
  const start = Date.now()
  const url = `${source.baseUrl.replace(/\/$/, '')}/v1/chat/completions`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${source.apiKey}`,
    },
    body: JSON.stringify({ ...body, stream: false }),
  })

  const latencyMs = Date.now() - start

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    return {
      response: new Response(errText, { status: res.status, headers: { 'Content-Type': 'application/json' } }),
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs,
      statusCode: res.status,
      errorMsg: errText.slice(0, 500),
    }
  }

  const data = await res.json()
  const usage = extractUsageFromResponse(data as Record<string, unknown>)

  return {
    response: Response.json(data),
    usage,
    latencyMs,
    statusCode: res.status,
  }
}

export interface StreamForwardResult {
  response: Response
  usagePromise: Promise<TokenUsage>
  latencyMs: number
  statusCode: number
  errorMsg?: string
}

/**
 * 流式请求转发：注入 stream_options 以获取 usage，透传 SSE 给客户端
 */
export async function forwardStream(
  source: Source,
  body: Record<string, unknown>,
): Promise<StreamForwardResult> {
  const start = Date.now()
  const url = `${source.baseUrl.replace(/\/$/, '')}/v1/chat/completions`

  const upstreamBody = {
    ...body,
    stream: true,
    stream_options: { include_usage: true },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${source.apiKey}`,
    },
    body: JSON.stringify(upstreamBody),
  })

  const latencyMs = Date.now() - start

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => res.statusText)
    return {
      response: new Response(errText, {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      }),
      usagePromise: Promise.resolve({ promptTokens: 0, completionTokens: 0, totalTokens: 0 }),
      latencyMs,
      statusCode: res.status,
      errorMsg: errText.slice(0, 500),
    }
  }

  let resolveUsage: (u: TokenUsage) => void
  const usagePromise = new Promise<TokenUsage>(r => { resolveUsage = r })

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        if (buffer.trim()) controller.enqueue(new TextEncoder().encode(buffer))
        controller.close()
        resolveUsage(finalUsage)
        return
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) {
          controller.enqueue(new TextEncoder().encode('\n'))
          continue
        }
        // 提取 usage
        const usage = extractUsageFromStreamChunk(trimmed)
        if (usage) finalUsage = usage
        controller.enqueue(new TextEncoder().encode(trimmed + '\n'))
      }
    },
    cancel() {
      reader.cancel()
      resolveUsage(finalUsage)
    },
  })

  return {
    response: new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }),
    usagePromise,
    latencyMs,
    statusCode: res.status,
  }
}
