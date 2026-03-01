import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

const ADMIN_SESSIONS = globalThis as unknown as {
  __adminSessions?: Map<string, { username: string; expires: number }>
}

function getSessionMap() {
  if (!ADMIN_SESSIONS.__adminSessions) {
    ADMIN_SESSIONS.__adminSessions = new Map()
  }
  return ADMIN_SESSIONS.__adminSessions
}

export function verifyAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value
  if (!token) return false

  const sessions = getSessionMap()
  const hashedToken = createHash('sha256').update(token).digest('hex')
  const session = sessions.get(hashedToken)

  if (!session || session.expires < Date.now()) {
    if (session) sessions.delete(hashedToken)
    return false
  }

  return true
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
