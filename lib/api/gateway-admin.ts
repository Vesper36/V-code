/**
 * Gateway Admin API Client
 * 直接调用 /api/admin/* 路由，替代旧的 admin-proxy 转发模式
 */

export interface GatewaySource {
  id: number
  name: string
  baseUrl: string
  apiKey: string
  models: string[]
  priority: number
  weight: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface GatewayModelConfig {
  id: number
  modelId: string
  displayName: string
  inputPrice: number
  outputPrice: number
  rpm: number
  tpm: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface GatewayApiKey {
  id: number
  name: string
  key: string
  status: number
  allowedModels: string[]
  totalQuota: number
  usedQuota: number
  dailyQuota: number | null
  dailyUsed: number
  dailyResetAt: string | null
  monthlyQuota: number | null
  monthlyUsed: number
  monthlyResetAt: string | null
  rpm: number
  tpm: number
  expiredAt: string | null
  lastUsedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface GatewayRequestLog {
  id: number
  apiKeyId: number
  keyName: string
  modelId: string
  sourceId: number | null
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  latencyMs: number
  statusCode: number
  isStream: boolean
  errorMsg: string | null
  createdAt: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  perPage: number
}

export interface DashboardStats {
  totalKeys: number
  activeKeys: number
  totalSources: number
  todayRequests: number
  todayCost: number
  todayTokens: number
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || res.statusText)
  }
  return res.json()
}

// ========== Sources ==========

export async function getSources(page = 1, perPage = 20) {
  return fetchAPI<Paginated<GatewaySource>>(`/api/admin/sources?page=${page}&perPage=${perPage}`)
}

export async function createSource(data: Partial<GatewaySource>) {
  return fetchAPI<GatewaySource>('/api/admin/sources', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateSource(id: number, data: Partial<GatewaySource>) {
  return fetchAPI<GatewaySource>(`/api/admin/sources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteSource(id: number) {
  return fetchAPI<{ success: boolean }>(`/api/admin/sources/${id}`, { method: 'DELETE' })
}

// ========== Models ==========

export async function getModels(page = 1, perPage = 50) {
  return fetchAPI<Paginated<GatewayModelConfig>>(`/api/admin/models?page=${page}&perPage=${perPage}`)
}

export async function createModel(data: Partial<GatewayModelConfig>) {
  return fetchAPI<GatewayModelConfig>('/api/admin/models', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateModel(id: number, data: Partial<GatewayModelConfig>) {
  return fetchAPI<GatewayModelConfig>(`/api/admin/models/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteModel(id: number) {
  return fetchAPI<{ success: boolean }>(`/api/admin/models/${id}`, { method: 'DELETE' })
}

// ========== API Keys ==========

export async function getApiKeys(page = 1, perPage = 20) {
  return fetchAPI<Paginated<GatewayApiKey>>(`/api/admin/keys?page=${page}&perPage=${perPage}`)
}

export async function createApiKey(data: {
  name: string
  allowedModels?: string[]
  totalQuota?: number
  dailyQuota?: number | null
  monthlyQuota?: number | null
  rpm?: number
  tpm?: number
  expiredAt?: string | null
}) {
  return fetchAPI<GatewayApiKey>('/api/admin/keys', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateApiKey(id: number, data: Partial<GatewayApiKey>) {
  return fetchAPI<GatewayApiKey>(`/api/admin/keys/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteApiKey(id: number) {
  return fetchAPI<{ success: boolean }>(`/api/admin/keys/${id}`, { method: 'DELETE' })
}

// ========== Logs ==========

export async function getLogs(params: {
  page?: number
  perPage?: number
  keyId?: number
  modelId?: string
  startDate?: string
  endDate?: string
} = {}) {
  const query = new URLSearchParams()
  query.set('page', String(params.page || 1))
  query.set('perPage', String(params.perPage || 20))
  if (params.keyId) query.set('keyId', String(params.keyId))
  if (params.modelId) query.set('modelId', params.modelId)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
  return fetchAPI<Paginated<GatewayRequestLog>>(`/api/admin/logs?${query}`)
}

// ========== Stats ==========

export async function getDashboardStats() {
  return fetchAPI<DashboardStats>('/api/admin/stats')
}

export interface TrendItem {
  date: string
  requests: number
  cost: number
  tokens: number
}

export interface ModelDistItem {
  model: string
  requests: number
  cost: number
  tokens: number
}

export interface KeyUsageItem {
  keyName: string
  requests: number
  cost: number
  tokens: number
}

export async function getUsageTrend(days = 7) {
  return fetchAPI<TrendItem[]>(`/api/admin/stats?type=trend&days=${days}`)
}

export async function getModelDistribution() {
  return fetchAPI<ModelDistItem[]>('/api/admin/stats?type=models')
}

export async function getKeyUsage() {
  return fetchAPI<KeyUsageItem[]>('/api/admin/stats?type=keys')
}

// ========== Source Utils ==========

export async function fetchUpstreamModels(baseUrl: string, apiKey: string) {
  return fetchAPI<{ models: string[] }>('/api/admin/source-models', {
    method: 'POST',
    body: JSON.stringify({ baseUrl, apiKey }),
  })
}
