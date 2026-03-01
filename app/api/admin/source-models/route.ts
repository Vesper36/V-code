import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { baseUrl, apiKey } = await request.json()
  if (!baseUrl || !apiKey) {
    return NextResponse.json({ error: 'baseUrl and apiKey are required' }, { status: 400 })
  }

  try {
    const url = `${baseUrl.replace(/\/+$/, '')}/v1/models`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return NextResponse.json({ error: `Upstream returned ${res.status}: ${text}` }, { status: 502 })
    }

    const data = await res.json()
    const models: string[] = Array.isArray(data?.data)
      ? data.data.map((m: any) => m.id).filter(Boolean).sort()
      : []

    return NextResponse.json({ models })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch models from upstream' },
      { status: 502 },
    )
  }
}
