import { prisma } from '@/lib/db/prisma'
import type { ApiKey } from '@prisma/client'

export interface AuthResult {
  success: boolean
  apiKey?: ApiKey
  error?: string
  statusCode?: number
}

/**
 * 从 Authorization header 提取并验证 API Key
 */
export async function authenticateRequest(authHeader: string | null): Promise<AuthResult> {
  if (!authHeader) {
    return { success: false, error: 'Missing Authorization header', statusCode: 401 }
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim()

  if (!token) {
    return { success: false, error: 'Invalid Authorization header', statusCode: 401 }
  }

  const apiKey = await prisma.apiKey.findUnique({ where: { key: token } })

  if (!apiKey) {
    return { success: false, error: 'Invalid API key', statusCode: 401 }
  }

  if (apiKey.status !== 1) {
    return { success: false, error: 'API key is disabled', statusCode: 403 }
  }

  if (apiKey.expiredAt && new Date(apiKey.expiredAt) < new Date()) {
    return { success: false, error: 'API key has expired', statusCode: 403 }
  }

  return { success: true, apiKey }
}

/**
 * 检查 API Key 是否有权限访问指定模型
 */
export function checkModelPermission(apiKey: ApiKey, modelId: string): boolean {
  const allowed = apiKey.allowedModels as string[]
  if (!allowed || allowed.length === 0) return true
  return allowed.includes(modelId)
}
