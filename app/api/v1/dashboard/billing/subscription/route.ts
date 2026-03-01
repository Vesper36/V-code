import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/gateway/auth'

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request.headers.get('Authorization'))
  if (!auth.success || !auth.apiKey) {
    return Response.json(
      { error: { message: auth.error, type: 'error' } },
      { status: auth.statusCode ?? 401 },
    )
  }

  const key = auth.apiKey
  const totalQuota = Number(key.totalQuota)
  const usedQuota = Number(key.usedQuota)
  const remaining = Math.max(0, totalQuota - usedQuota)

  return Response.json({
    object: 'billing_subscription',
    has_payment_method: true,
    hard_limit_usd: totalQuota,
    soft_limit_usd: totalQuota,
    system_hard_limit_usd: totalQuota,
    access_until: key.expiredAt
      ? Math.floor(new Date(key.expiredAt).getTime() / 1000)
      : 0,
    balance: remaining,
    used: usedQuota,
  })
}
